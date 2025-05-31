import numpy as np
from shapely.geometry import Point, Polygon
import pyproj
import math
import json
import logging
from config import Config

logger = logging.getLogger(__name__)

def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees)
    
    Parameters:
    - lat1, lon1: Coordinates of point 1
    - lat2, lon2: Coordinates of point 2
    
    Returns:
    - Distance in meters
    """
    # Convert decimal degrees to radians
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    
    # Haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    r = 6371000  # Radius of earth in meters
    
    return c * r

def get_point_at_distance(lat, lon, bearing, distance):
    """
    Get coordinates of a point at a given distance and bearing from start point
    
    Parameters:
    - lat, lon: Starting coordinates in decimal degrees
    - bearing: Bearing in degrees (0 = north, 90 = east, etc.)
    - distance: Distance in meters
    
    Returns:
    - (lat, lon) of destination point
    """
    # Convert to radians
    lat1 = math.radians(lat)
    lon1 = math.radians(lon)
    bearing = math.radians(bearing)
    
    # Earth's radius in meters
    R = 6371000
    
    # Calculate new coordinates
    lat2 = math.asin(math.sin(lat1) * math.cos(distance/R) + 
                     math.cos(lat1) * math.sin(distance/R) * math.cos(bearing))
    
    lon2 = lon1 + math.atan2(math.sin(bearing) * math.sin(distance/R) * math.cos(lat1),
                             math.cos(distance/R) - math.sin(lat1) * math.sin(lat2))
    
    # Convert back to degrees
    lat2 = math.degrees(lat2)
    lon2 = math.degrees(lon2)
    
    return lat2, lon2

def calculate_threat_zone(latitude, longitude, explosion_params, dispersion_params, wind_speed, wind_direction):
    """
    Calculate threat zones based on explosion and dispersion parameters
    
    Parameters:
    - latitude, longitude: Source coordinates
    - explosion_params: Dictionary with explosion model outputs
    - dispersion_params: Dictionary with dispersion model outputs
    - wind_speed: Wind speed in m/s
    - wind_direction: Wind direction in degrees from north
    
    Returns:
    - Dictionary with threat zone polygons
    """
    try:
        # Extract key parameters
        energy_release = explosion_params.get('energy_release', 100)  # MJ
        blast_radii = {
            'high': explosion_params['distance_to_overpressure'].get('15kPa', 100),
            'medium': explosion_params['distance_to_overpressure'].get('7kPa', 200),
            'low': explosion_params['distance_to_overpressure'].get('3kPa', 300)
        }
        
        thermal_radii = {
            'high': explosion_params['distance_to_radiation'].get('10kW/m²', 100),
            'medium': explosion_params['distance_to_radiation'].get('5kW/m²', 200),
            'low': explosion_params['distance_to_radiation'].get('2kW/m²', 300)
        }
        
        plume_length = dispersion_params.get('plume_length', 500)
        plume_width = dispersion_params.get('plume_width', 200)
        
        # Create circular blast zones
        blast_zones = {}
        for level, radius in blast_radii.items():
            blast_zones[level] = _create_circle_polygon(latitude, longitude, radius)
        
        # Create circular thermal zones
        thermal_zones = {}
        for level, radius in thermal_radii.items():
            thermal_zones[level] = _create_circle_polygon(latitude, longitude, radius)
        
        # Create elliptical dispersion zone oriented according to wind direction
        dispersion_zones = {
            'high': _create_ellipse_polygon(latitude, longitude, plume_length * 0.3, plume_width * 0.3, wind_direction),
            'medium': _create_ellipse_polygon(latitude, longitude, plume_length * 0.6, plume_width * 0.6, wind_direction),
            'low': _create_ellipse_polygon(latitude, longitude, plume_length, plume_width, wind_direction)
        }
        
        # Combine zones
        result = {
            'blast_zones': {k: _polygon_to_coordinates(v) for k, v in blast_zones.items()},
            'thermal_zones': {k: _polygon_to_coordinates(v) for k, v in thermal_zones.items()},
            'dispersion_zones': {k: _polygon_to_coordinates(v) for k, v in dispersion_zones.items()},
            'combined_threat_zones': {
                # For each threat level, take the union of blast, thermal, and dispersion zones
                'high': _polygon_to_coordinates(_combine_zones([
                    blast_zones['high'], thermal_zones['high'], dispersion_zones['high']
                ])),
                'medium': _polygon_to_coordinates(_combine_zones([
                    blast_zones['medium'], thermal_zones['medium'], dispersion_zones['medium']
                ])),
                'low': _polygon_to_coordinates(_combine_zones([
                    blast_zones['low'], thermal_zones['low'], dispersion_zones['low']
                ]))
            }
        }
        
        return result
        
    except Exception as e:
        logger.error(f"Error calculating threat zones: {str(e)}")
        # Return simple circular zones as fallback
        return {
            'blast_zones': {
                'high': _polygon_to_coordinates(_create_circle_polygon(latitude, longitude, 100)),
                'medium': _polygon_to_coordinates(_create_circle_polygon(latitude, longitude, 200)),
                'low': _polygon_to_coordinates(_create_circle_polygon(latitude, longitude, 300))
            }
        }

def _create_circle_polygon(center_lat, center_lon, radius, num_points=36):
    """
    Create a circle polygon given center coordinates and radius
    
    Parameters:
    - center_lat, center_lon: Center coordinates
    - radius: Radius in meters
    - num_points: Number of points to use for the polygon
    
    Returns:
    - Shapely Polygon object
    """
    coords = []
    for i in range(num_points):
        angle = math.radians(i * (360 / num_points))
        lat, lon = get_point_at_distance(center_lat, center_lon, angle, radius)
        coords.append((lon, lat))  # Note: GeoJSON is (lon, lat)
    
    # Close the polygon
    coords.append(coords[0])
    
    return Polygon(coords)

def _create_ellipse_polygon(center_lat, center_lon, major_axis, minor_axis, rotation, num_points=36):
    """
    Create an ellipse polygon centered at the given coordinates
    
    Parameters:
    - center_lat, center_lon: Center coordinates
    - major_axis: Major axis length in meters
    - minor_axis: Minor axis length in meters
    - rotation: Rotation in degrees from north
    - num_points: Number of points to use for the polygon
    
    Returns:
    - Shapely Polygon object
    """
    coords = []
    
    # Generate a circle, then scale to make an ellipse
    for i in range(num_points):
        angle = math.radians(i * (360 / num_points))
        
        # Calculate distances along the axes
        dx = minor_axis * math.sin(angle)
        dy = major_axis * math.cos(angle)
        
        # Apply rotation
        rot_rad = math.radians(rotation)
        dx_rot = dx * math.cos(rot_rad) - dy * math.sin(rot_rad)
        dy_rot = dx * math.sin(rot_rad) + dy * math.cos(rot_rad)
        
        # Calculate the lat/lon of this point
        dist = math.sqrt(dx_rot**2 + dy_rot**2)
        bearing = math.degrees(math.atan2(dx_rot, dy_rot))
        
        lat, lon = get_point_at_distance(center_lat, center_lon, bearing, dist)
        coords.append((lon, lat))  # Note: GeoJSON is (lon, lat)
    
    # Close the polygon
    coords.append(coords[0])
    
    return Polygon(coords)

def _polygon_to_coordinates(polygon):
    """
    Convert a Shapely polygon to a list of coordinates
    
    Parameters:
    - polygon: Shapely Polygon object
    
    Returns:
    - List of [lon, lat] coordinates
    """
    if polygon is None:
        return []
    
    # Extract exterior coordinates
    coords = list(polygon.exterior.coords)
    
    # Format as [lon, lat] pairs
    formatted_coords = [[lon, lat] for lon, lat in coords]
    
    return formatted_coords

def _combine_zones(polygons):
    """
    Combine multiple polygons using union operation
    
    Parameters:
    - polygons: List of Shapely polygon objects
    
    Returns:
    - Combined Shapely polygon
    """
    if not polygons:
        return None
    
    if len(polygons) == 1:
        return polygons[0]
    
    try:
        # Start with the first polygon
        result = polygons[0]
        
        # Union with the rest
        for polygon in polygons[1:]:
            if polygon is not None:
                result = result.union(polygon)
        
        return result
    except Exception as e:
        logger.error(f"Error combining zones: {str(e)}")
        # Return the first polygon as a fallback
        return polygons[0]

def gps_to_grid_coordinates(latitude, longitude, reference_lat=None, reference_lon=None):
    """
    Convert GPS coordinates to a local grid system
    
    Parameters:
    - latitude, longitude: GPS coordinates to convert
    - reference_lat, reference_lon: Reference point (origin of grid)
    
    Returns:
    - (x, y) coordinates in meters
    """
    # If no reference point provided, use the input point as reference
    if reference_lat is None:
        reference_lat = latitude
    if reference_lon is None:
        reference_lon = longitude
    
    # Define projections
    wgs84 = pyproj.CRS('EPSG:4326')  # WGS84 system (lat/lon)
    
    # Create a local projection centered at the reference point
    # UTM is a good choice for local projections
    # First, determine the UTM zone for the reference point
    utm_zone = int((reference_lon + 180) / 6) + 1
    
    # Define the projection string
    utm_proj = f"+proj=utm +zone={utm_zone} +datum=WGS84 +units=m +no_defs"
    utm = pyproj.CRS.from_proj4(utm_proj)
    
    # Create transformer
    transformer = pyproj.Transformer.from_crs(wgs84, utm, always_xy=True)
    
    # Transform reference point
    ref_x, ref_y = transformer.transform(reference_lon, reference_lat)
    
    # Transform target point
    x, y = transformer.transform(longitude, latitude)
    
    # Calculate relative coordinates
    rel_x = x - ref_x
    rel_y = y - ref_y
    
    return rel_x, rel_y

def grid_to_gps_coordinates(x, y, reference_lat, reference_lon):
    """
    Convert local grid coordinates back to GPS coordinates
    
    Parameters:
    - x, y: Local grid coordinates in meters
    - reference_lat, reference_lon: Reference point (origin of grid)
    
    Returns:
    - (latitude, longitude) coordinates
    """
    # Define projections
    wgs84 = pyproj.CRS('EPSG:4326')  # WGS84 system (lat/lon)
    
    # Create a local projection centered at the reference point
    utm_zone = int((reference_lon + 180) / 6) + 1
    utm_proj = f"+proj=utm +zone={utm_zone} +datum=WGS84 +units=m +no_defs"
    utm = pyproj.CRS.from_proj4(utm_proj)
    
    # Create transformer
    transformer = pyproj.Transformer.from_crs(wgs84, utm, always_xy=True)
    
    # Transform reference point to UTM
    ref_x, ref_y = transformer.transform(reference_lon, reference_lat)
    
    # Calculate absolute UTM coordinates
    abs_x = ref_x + x
    abs_y = ref_y + y
    
    # Create inverse transformer
    inverse_transformer = pyproj.Transformer.from_crs(utm, wgs84, always_xy=True)
    
    # Transform back to WGS84
    lon, lat = inverse_transformer.transform(abs_x, abs_y)
    
    return lat, lon
