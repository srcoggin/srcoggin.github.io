# utils.py
import streamlit as st
import pandas as pd
import os
import numpy as np

# --- CONFIGURATION ---
JSON_DATA_FOLDER = "json_data"
SEASONS = [2019, 2020, 2021, 2022, 2023, 2024, 2025]

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
    # 1. Aggregation
    stats = df.groupby(['player_display_name', 'position', 'recent_team']).agg(
        Total_Games=('week', 'count'), 
        Avg_Points=('fantasy_points_ppr', 'mean'), 
        Max_Points=('fantasy_points_ppr', 'max')
    ).reset_index()
    
    # 2. Count Booms/Busts
    booms = df[df['fantasy_points_ppr'] >= 25].groupby('player_display_name')['week'].count().reset_index(name='Boom_Weeks')
    busts = df[df['fantasy_points_ppr'] < 8].groupby('player_display_name')['week'].count().reset_index(name='Bust_Weeks')
    
    stats = stats.merge(booms, on='player_display_name', how='left').fillna(0)
    stats = stats.merge(busts, on='player_display_name', how='left').fillna(0)
    
    # 3. DYNAMIC FILTER (The Fix)
    # If the max games played in the current view is < 5 (e.g. early season), use 1 game min.
    # Otherwise, use 5 game min to filter noise.
    if not stats.empty:
        max_games_in_set = stats['Total_Games'].max()
        threshold = 5 if max_games_in_set >= 5 else 1
    else:
        threshold = 1
        
    stats = stats[stats['Total_Games'] >= threshold]
    
    # 4. Calculate Real EPA Avg
    # Ensure cols exist
    for col in ['passing_epa', 'rushing_epa', 'receiving_epa']:
        if col not in df.columns: df[col] = 0.0
            
    df['total_epa_raw'] = df['passing_epa'].fillna(0) + df['rushing_epa'].fillna(0) + df['receiving_epa'].fillna(0)
    epa_real = df.groupby('player_display_name')['total_epa_raw'].mean().reset_index(name='Real_Avg_EPA')
    stats = stats.merge(epa_real, on='player_display_name', how='left')
    
    return stats