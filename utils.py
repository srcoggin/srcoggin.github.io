# utils.py
import streamlit as st
import pandas as pd
import os
import numpy as np
import json

# --- CONFIGURATION ---
JSON_DATA_FOLDER = "json_data"
SEASONS = [2019, 2020, 2021, 2022, 2023, 2024, 2025]

# --- THEME TOGGLE ---
def render_theme_toggle():
    """Renders a light/dark mode toggle in the top right corner of the page."""
    # Initialize theme in session state
    if 'theme' not in st.session_state:
        st.session_state.theme = 'dark'
    
    # Create columns to push toggle to the right
    col_spacer, col_toggle = st.columns([10, 1])
    
    with col_toggle:
        # Toggle button
        if st.session_state.theme == 'dark':
            if st.button("☀️", help="Switch to Light Mode", key="theme_toggle"):
                st.session_state.theme = 'light'
                st.rerun()
        else:
            if st.button("🌙", help="Switch to Dark Mode", key="theme_toggle"):
                st.session_state.theme = 'dark'
                st.rerun()
    
    # Apply theme CSS
    if st.session_state.theme == 'light':
        st.markdown("""
            <style>
            /* Light mode overrides */
            .stApp {
                background-color: #ffffff;
                color: #1a1a1a;
            }
            .stMarkdown, .stText, p, span, label, .stSelectbox label, .stMultiSelect label {
                color: #1a1a1a !important;
            }
            h1, h2, h3, h4, h5, h6 {
                color: #1a1a1a !important;
            }
            .stDataFrame {
                background-color: #f8f9fa;
            }
            .stSidebar {
                background-color: #f0f2f6;
            }
            .stSidebar .stMarkdown, .stSidebar p, .stSidebar span, .stSidebar label {
                color: #1a1a1a !important;
            }
            div[data-testid="stMetricValue"] {
                color: #1a1a1a !important;
            }
            div[data-testid="stMetricLabel"] {
                color: #4a4a4a !important;
            }
            .stTabs [data-baseweb="tab-list"] {
                background-color: #f0f2f6;
            }
            .stTabs [data-baseweb="tab"] {
                color: #1a1a1a;
            }
            .stExpander {
                background-color: #f8f9fa;
                border-color: #e0e0e0;
            }
            .stAlert {
                background-color: #f8f9fa;
            }
            </style>
        """, unsafe_allow_html=True)
    else:
        # Dark mode (default Streamlit dark theme - minimal overrides needed)
        st.markdown("""
            <style>
            /* Dark mode - use Streamlit defaults with minor tweaks */
            .stApp {
                background-color: #0e1117;
            }
            </style>
        """, unsafe_allow_html=True)

# --- 2. LOADER (STATS) ---
@st.cache_resource
def load_data_from_disk():
    try:
        dfs = []
        for year in SEASONS:
            json_path = os.path.join(JSON_DATA_FOLDER, f"stats_{year}.json")
            if os.path.exists(json_path):
                print(f"Loading {json_path}...")
                df_year = pd.read_json(json_path)
                dfs.append(df_year)
            else:
                print(f"⚠️ File '{json_path}' not found.")
        
        if not dfs:
            print("No data files found!")
            return pd.DataFrame()
        
        df = pd.concat(dfs, ignore_index=True)
        print(f"Loaded {len(df)} total records")

        # Standardize column names
        column_map = {
            'team': 'recent_team',
            'def_team': 'opponent_team', 
            'posteam': 'recent_team',
            'display_name': 'player_display_name' 
        }
        df = df.rename(columns=column_map)
        df = df.loc[:, ~df.columns.duplicated()]
        df = df.drop_duplicates(subset=['player_display_name', 'season', 'week'])

        # Filter: 2019+ and Regular Season (Week <= 18)
        df = df[(df['season'] >= 2019) & (df['week'] <= 18)]
        
        target_positions = ['QB', 'RB', 'WR', 'TE', 'FB', 'K', 'DEF']
        df = df[df['position'].isin(target_positions)]
        
        # --- FIX & FILL STATS ---
        # 1. Define all the stats we want to track
        stat_cols = [
            'passing_epa', 'rushing_epa', 'receiving_epa', 'fantasy_points_ppr',
            'fg_made', 'fg_att', 'pat_made', 'pat_att',
            # NEW: General Box Score Stats
            'passing_yards', 'passing_tds', 'passing_interceptions',
            'rushing_yards', 'rushing_tds', 
            'receptions', 'receiving_yards', 'receiving_tds', 'targets'
        ]
        
        # 2. Ensure they exist and fill NaNs with 0.0
        for col in stat_cols:
            if col not in df.columns:
                df[col] = 0.0
            else:
                df[col] = df[col].fillna(0.0)

        # Kicker Logic
        is_kicker = df['position'] == 'K'
        kicker_points = (df['fg_made'] * 3) + (df['pat_made'] * 1)
        df.loc[is_kicker, 'fantasy_points_ppr'] = kicker_points[is_kicker]

        df['fg_pct'] = np.where(df['fg_att'] > 0, (df['fg_made'] / df['fg_att'] * 100), 0.0)
        df['pat_pct'] = np.where(df['pat_att'] > 0, (df['pat_made'] / df['pat_att'] * 100), 0.0)
        
        # 3. Return the full list of columns (including bio data and headshot URL)
        bio_cols = ['height', 'weight', 'college_name', 'jersey_number', 'headshot_url']
        needed_cols = ['player_display_name', 'position', 'recent_team', 'season', 'week', 
                       'opponent_team'] + stat_cols + ['fg_pct', 'pat_pct'] + bio_cols
        
        # Safety check to ensure all needed_cols actually exist in df
        final_cols = [c for c in needed_cols if c in df.columns]
        
        return df[final_cols]

    except Exception as e:
        print(f"Critical Error Loading Data: {e}")
        return pd.DataFrame()

# --- 3. METRICS CALCULATORS ---
def get_player_metrics(df, player_name):
    p_df = df[df['player_display_name'] == player_name].sort_values('week')
    if p_df.empty: return None

    # Recalculate Total EPA safely
    p_df['total_epa'] = p_df['passing_epa'].fillna(0) + p_df['rushing_epa'].fillna(0) + p_df['receiving_epa'].fillna(0)
    
    pass_df = df[df['position'].isin(['QB', 'WR', 'TE'])]
    pass_def = pass_df.groupby('opponent_team')['fantasy_points_ppr'].sum().reset_index()
    pass_def['Pass Def Rank'] = pass_def['fantasy_points_ppr'].rank(ascending=True)
    pass_def = pass_def[['opponent_team', 'Pass Def Rank']]
    
    rush_df = df[df['position'] == 'RB']
    rush_def = rush_df.groupby('opponent_team')['fantasy_points_ppr'].sum().reset_index()
    rush_def['Rush Def Rank'] = rush_def['fantasy_points_ppr'].rank(ascending=True)
    rush_def = rush_def[['opponent_team', 'Rush Def Rank']]
    
    p_df = p_df.merge(pass_def, how='left', on='opponent_team')
    p_df = p_df.merge(rush_def, how='left', on='opponent_team')
    
    # RENAME COLUMNS FOR UI (Short & Clean)
    rename_map = {
        'week': 'Week', 
        'fantasy_points_ppr': 'Points', 
        'total_epa': 'EPA', 
        'opponent_team': 'Opponent',
        'fg_made': 'FG M', 'fg_att': 'FG A', 'fg_pct': 'FG%',
        'pat_made': 'PAT M', 'pat_att': 'PAT A', 'pat_pct': 'PAT%',
        # Box Score Renaming
        'passing_yards': 'Pass Yds', 'passing_tds': 'Pass TD', 'passing_interceptions': 'Int',
        'rushing_yards': 'Rush Yds', 'rushing_tds': 'Rush TD',
        'receptions': 'Rec', 'receiving_yards': 'Rec Yds', 'receiving_tds': 'Rec TD', 'targets': 'Tgt'
    }
    p_df = p_df.rename(columns=rename_map)
    return p_df

def calculate_boom_bust(df):
    """Calculates Boom/Bust metrics with dynamic game threshold."""
    # Work on a copy to avoid modifying the input dataframe
    df_copy = df.copy()
    
    # 1. Aggregation
    stats = df_copy.groupby(['player_display_name', 'position', 'recent_team']).agg(
        Total_Games=('week', 'count'), 
        Avg_Points=('fantasy_points_ppr', 'mean'), 
        Max_Points=('fantasy_points_ppr', 'max')
    ).reset_index()
    
    # 2. Count Booms/Busts
    booms = df_copy[df_copy['fantasy_points_ppr'] >= 25].groupby('player_display_name')['week'].count().reset_index(name='Boom_Weeks')
    busts = df_copy[df_copy['fantasy_points_ppr'] < 8].groupby('player_display_name')['week'].count().reset_index(name='Bust_Weeks')
    
    stats = stats.merge(booms, on='player_display_name', how='left').fillna(0)
    stats = stats.merge(busts, on='player_display_name', how='left').fillna(0)
    
    # 3. DYNAMIC FILTER
    # If the max games played in the current view is < 5 (e.g. early season), use 1 game min.
    # Otherwise, use 5 game min to filter noise.
    if not stats.empty:
        max_games_in_set = stats['Total_Games'].max()
        threshold = 5 if max_games_in_set >= 5 else 1
    else:
        threshold = 1
        
    stats = stats[stats['Total_Games'] >= threshold]
    
    # 4. Calculate Real EPA Avg
    # Ensure cols exist in the copy
    for col in ['passing_epa', 'rushing_epa', 'receiving_epa']:
        if col not in df_copy.columns: 
            df_copy[col] = 0.0
            
    df_copy['total_epa_raw'] = df_copy['passing_epa'].fillna(0) + df_copy['rushing_epa'].fillna(0) + df_copy['receiving_epa'].fillna(0)
    epa_real = df_copy.groupby('player_display_name')['total_epa_raw'].mean().reset_index(name='Real_Avg_EPA')
    stats = stats.merge(epa_real, on='player_display_name', how='left')
    
    return stats


# --- PLAYER PROFILES ---
@st.cache_data
def load_player_profiles(season=2025):
    """Load player profiles from JSON file."""
    profiles_path = os.path.join(JSON_DATA_FOLDER, f'player_profiles_{season}.json')
    if os.path.exists(profiles_path):
        with open(profiles_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return data.get('profiles', {})
    return {}


def get_player_profile(player_name, season=2025):
    """Get a specific player's profile."""
    profiles = load_player_profiles(season)
    return profiles.get(player_name, None)


# --- REUSABLE UI COMPONENTS ---
def render_year_selector(df, key_prefix):
    """
    Renders a year selector dropdown and returns the selected year.
    
    Args:
        df: DataFrame with 'season' column
        key_prefix: Unique key prefix for the widget (e.g., 'dd', 'bb')
    
    Returns:
        int: Selected year
    """
    available_years = sorted(df['season'].unique(), reverse=True)
    col_year, _ = st.columns([2, 10])
    with col_year:
        return st.selectbox("📅 Select Season", available_years, index=0, key=f"{key_prefix}_year")


# --- DATA HELPERS ---
def safe_get(row, column, default="-"):
    """
    Safely get a value from a DataFrame row, returning default if missing or NaN.
    
    Args:
        row: DataFrame row (Series)
        column: Column name to retrieve
        default: Value to return if missing or NaN
    
    Returns:
        The value or default
    """
    if column not in row.index:
        return default
    val = row.get(column)
    if pd.isna(val):
        return default
    return val


def format_height(height_inches):
    """
    Convert height from inches to a formatted string with feet/inches and centimeters.
    
    Args:
        height_inches: Height in inches (int or float)
    
    Returns:
        str: Formatted height like "6'1\" (185cm)" or "-" if invalid
    """
    if pd.isna(height_inches):
        return "-"
    try:
        height_inches = int(height_inches)
        feet = height_inches // 12
        inches = height_inches % 12
        cm = round(height_inches * 2.54)
        return f"{feet}'{inches}\" ({cm}cm)"
    except (ValueError, TypeError):
        return "-"


def format_weight(weight_val):
    """
    Format weight value to display string.
    
    Args:
        weight_val: Weight in pounds
    
    Returns:
        str: Formatted weight like "220 lbs" or "-" if invalid
    """
    if pd.isna(weight_val):
        return "-"
    try:
        return f"{int(weight_val)} lbs"
    except (ValueError, TypeError):
        return "-"


# --- HEADSHOT UTILITIES ---
HEADSHOTS_DIR = os.path.join(os.path.dirname(__file__), "headshots")


def get_headshot_path(player_name: str, position: str) -> str:
    """
    Get local file path for player headshot, falling back to default if not found.
    
    Args:
        player_name: Player's display name
        position: Player's position code
    
    Returns:
        str: Path to headshot image file
    """
    # Build filename: "First_Last_POS.png"
    # Remove periods (e.g., "A.J. Brown" -> "AJ Brown") and replace spaces with underscores
    clean_name = player_name.replace('.', '').replace(' ', '_')
    filename = f"{clean_name}_{position}.png"
    filepath = os.path.join(HEADSHOTS_DIR, filename)
    
    if os.path.exists(filepath):
        return filepath
    # Fall back to default image
    return os.path.join(HEADSHOTS_DIR, "default.png")