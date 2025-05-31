import numpy as np
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors
import folium
import io
import base64
import os
from datetime import datetime
import logging
from config import Config

logger = logging.getLogger(__name__)

def generate_threat_zone_map(latitude, longitude, threat_zones):
    """
    Generate an interactive map with threat zones
    
    Parameters:
    - latitude, longitude: Source coordinates
    - threat_zones: Dictionary with threat zone polygons
    
    Returns:
    - Dictionary with map data including HTML content
    """
    try:
        # Create Folium map centered at the source
        m = folium.Map(location=[latitude, longitude], zoom_start=14)
        
        # Add marker for the source
        folium.Marker(
            location=[latitude, longitude],
            popup="Incident Source",
            icon=folium.Icon(color="red", icon="fire", prefix="fa")
        ).add_to(m)
        
        # Add combined threat zones
        for level, coords in threat_zones.get('combined_threat_zones', {}).items():
            color = _get_zone_color(level)
            name = f"{level.upper()} Risk Zone"
            
            # Format coordinates for Folium
            latlngs = [[lat, lon] for lon, lat in coords]
            
            folium.Polygon(
                locations=latlngs,
                color=color,
                fill=True,
                fill_color=color,
                fill_opacity=0.4,
                weight=2,
                popup=name
            ).add_to(m)
        
        # Add blast zones
        for level, coords in threat_zones.get('blast_zones', {}).items():
            color = _get_zone_color(level)
            name = f"{level.upper()} Blast Zone"
            
            # Format coordinates for Folium
            latlngs = [[lat, lon] for lon, lat in coords]
            
            folium.Polygon(
                locations=latlngs,
                color=color,
                fill=True,
                fill_color=color,
                fill_opacity=0.15,
                weight=1,
                popup=name,
                dash_array='5,5'
            ).add_to(m)
        
        # Add dispersion zones if available
        for level, coords in threat_zones.get('dispersion_zones', {}).items():
            color = _get_zone_color(level)
            name = f"{level.upper()} Dispersion Zone"
            
            # Format coordinates for Folium
            latlngs = [[lat, lon] for lon, lat in coords]
            
            folium.Polygon(
                locations=latlngs,
                color=color,
                fill=True,
                fill_color=color,
                fill_opacity=0.15,
                weight=1,
                popup=name,
                dash_array='5,5'
            ).add_to(m)
        
        # Save map to HTML string
        html_string = m._repr_html_()
        
        # Create map directory if it doesn't exist
        os.makedirs('static/maps', exist_ok=True)
        
        # Save to file with timestamp
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        filename = f"threat_map_{timestamp}.html"
        filepath = f"static/maps/{filename}"
        
        with open(filepath, 'w') as f:
            f.write(html_string)
        
        return {
            'map_html': html_string,
            'map_url': filepath
        }
        
    except Exception as e:
        logger.error(f"Error generating threat zone map: {str(e)}")
        return {
            'error': f"Failed to generate map: {str(e)}"
        }

def _get_zone_color(level):
    """Get color for different threat zone levels"""
    colors = {
        'high': 'red',
        'medium': 'orange',
        'low': 'yellow',
        'safe': 'green'
    }
    return colors.get(level.lower(), 'blue')

def plot_sensor_data(data, columns=None, time_column='timestamp', title='Sensor Readings'):
    """
    Create a time series plot of sensor data
    
    Parameters:
    - data: DataFrame with sensor readings and timestamps
    - columns: List of columns to plot (default: all numerical columns)
    - time_column: Name of the timestamp column
    - title: Plot title
    
    Returns:
    - Base64 encoded image
    """
    try:
        # Make a copy to avoid modifying original
        df = data.copy()
        
        # Convert timestamp to datetime if it's not already
        if time_column in df.columns:
            if not pd.api.types.is_datetime64_dtype(df[time_column]):
                df[time_column] = pd.to_datetime(df[time_column])
        else:
            logger.error(f"Time column '{time_column}' not found in data")
            return None
        
        # Set timestamp as index
        df = df.set_index(time_column)
        
        # Select columns to plot
        if columns is None:
            # Select all numeric columns
            numeric_columns = df.select_dtypes(include=['number']).columns.tolist()
            columns = numeric_columns
        else:
            # Filter for columns that exist in the data
            columns = [col for col in columns if col in df.columns]
        
        if not columns:
            logger.error("No valid columns to plot")
            return None
        
        # Create figure
        fig, ax = plt.subplots(figsize=(10, 6))
        
        # Plot each column
        for column in columns:
            ax.plot(df.index, df[column], label=column)
        
        # Add labels and legend
        ax.set_title(title)
        ax.set_xlabel('Time')
        ax.set_ylabel('Value')
        ax.legend()
        ax.grid(True)
        
        # Format dates on x-axis
        fig.autofmt_xdate()
        
        # Save to bytes
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=100)
        buf.seek(0)
        
        # Encode to base64
        img_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        plt.close(fig)
        
        return img_base64
        
    except Exception as e:
        logger.error(f"Error plotting sensor data: {str(e)}")
        return None
    
def _polygon_to_coordinates(polygon):
    return [(point.x, point.y) for point in polygon.exterior.coords]

def plot_threat_levels(data, time_column='timestamp', threat_column='risk_score'):
    """
    Create a time series plot of threat levels
    
    Parameters:
    - data: DataFrame with threat levels and timestamps
    - time_column: Name of the timestamp column
    - threat_column: Name of the threat level column
    
    Returns:
    - Base64 encoded image
    """
    try:
        # Make a copy to avoid modifying original
        df = data.copy()
        
        # Convert timestamp to datetime if it's not already
        if time_column in df.columns:
            if not pd.api.types.is_datetime64_dtype(df[time_column]):
                df[time_column] = pd.to_datetime(df[time_column])
        else:
            logger.error(f"Time column '{time_column}' not found in data")
            return None
        
        if threat_column not in df.columns:
            logger.error(f"Threat column '{threat_column}' not found in data")
            return None
        
        # Create figure
        fig, ax = plt.subplots(figsize=(10, 6))
        
        # Create colormap for risk levels
        cmap = plt.cm.get_cmap('RdYlGn_r')
        norm = mcolors.Normalize(vmin=0, vmax=1)
        
        # Plot threat level
        points = ax.scatter(df[time_column], df[threat_column], c=df[threat_column], 
                           cmap=cmap, norm=norm, s=50, alpha=0.7)
        
        # Add line connecting points
        ax.plot(df[time_column], df[threat_column], color='gray', alpha=0.5)
        
        # Add color bar
        cbar = plt.colorbar(points, ax=ax)
        cbar.set_label('Risk Level')
        
        # Add threshold lines
        config = Config()
        ax.axhline(y=config.ZONE_HIGH_THRESHOLD, color='red', linestyle='--', alpha=0.5, 
                  label=f'High Risk ({config.ZONE_HIGH_THRESHOLD})')
        ax.axhline(y=config.ZONE_MEDIUM_THRESHOLD, color='orange', linestyle='--', alpha=0.5,
                  label=f'Medium Risk ({config.ZONE_MEDIUM_THRESHOLD})')
        ax.axhline(y=config.ZONE_LOW_THRESHOLD, color='yellow', linestyle='--', alpha=0.5,
                  label=f'Low Risk ({config.ZONE_LOW_THRESHOLD})')
        
        # Add labels and legend
        ax.set_title('Threat Level Over Time')
        ax.set_xlabel('Time')
        ax.set_ylabel('Risk Score')
        ax.legend()
        ax.grid(True)
        
        # Format dates on x-axis
        fig.autofmt_xdate()
        
        # Set y-axis limits
        ax.set_ylim(0, 1)
        
        # Save to bytes
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=100)
        buf.seek(0)
        
        # Encode to base64
        img_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        plt.close(fig)
        
        return img_base64
        
    except Exception as e:
        logger.error(f"Error plotting threat levels: {str(e)}")
        return None
