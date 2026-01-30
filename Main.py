import streamlit as st
import pandas as pd
import requests
import os
import altair as alt

# --- CONFIGURATION ---
CURRENT_SEASON = 2025
FILE_PATH = "nfl_data_master.parquet"
MASTER_URL = "https://github.com/nflverse/nflverse-data/releases/download/player_stats/player_stats.parquet"

st.set_page_config(layout="wide", page_title="Fantasy Edge Pro", page_icon="🏈")

# ==========================================
#      CORE DATA ENGINE (Global Helpers)
# ==========================================

# --- 1. DOWNLOADER ---
def download_master_file():
    st.info(f"Downloading Master NFL Database... (This happens only once)")
    progress_bar = st.progress(0)
    try:
        response = requests.get(MASTER_URL, stream=True)
        total_size = int(response.headers.get('content-length', 0))
        block_size = 1024 * 1024 
        with open(FILE_PATH, "wb") as file:
            downloaded = 0
            for data in response.iter_content(block_size):
                file.write(data)
                downloaded += len(data)
                if total_size > 0:
                    progress_bar.progress(min(downloaded / total_size, 1.0))
        progress_bar.empty()
        st.success("✅ Download Complete!")
        return True
    except Exception as e:
        st.error(f"Download failed: {e}")
        return False

# --- 2. LOADER ---
@st.cache_resource
def load_data_from_disk():
    try:
        df = pd.read_parquet(FILE_PATH)
        
        # Self-Healing Map
        column_map = {
            'def_team': 'opponent_team', 
            'posteam': 'recent_team', 
            'player_name': 'player_display_name'
        }
        df = df.rename(columns=column_map)
        df = df.loc[:, ~df.columns.duplicated()]
        
        max_year = int(df['season'].max())
        target_year = CURRENT_SEASON if CURRENT_SEASON <= max_year else max_year
        
        # Filters
        df = df[df['season'] == target_year]
        df = df[df['week'] <= 18]
        df = df[df['position'].isin(['QB', 'RB', 'WR', 'TE'])]
        
        # Ensure Columns
        needed_cols = ['player_display_name', 'position', 'recent_team', 'week', 
                       'opponent_team', 'fantasy_points_ppr', 'passing_epa', 
                       'rushing_epa', 'receiving_epa', 'target_share']
        
        for col in needed_cols:
            if col not in df.columns: df[col] = 0
        
        return df[needed_cols].fillna(0), target_year

    except Exception:
        if os.path.exists(FILE_PATH): os.remove(FILE_PATH)
        return pd.DataFrame(), 0

# --- 3. METRICS CALCULATOR ---
def get_player_metrics(df, player_name):
    p_df = df[df['player_display_name'] == player_name].sort_values('week')
    if p_df.empty: return None, None
        
    p_df['total_epa'] = p_df['passing_epa'] + p_df['rushing_epa'] + p_df['receiving_epa']
    
    # Split Defense Ranks
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
    
    p_df = p_df.rename(columns={
        'week': 'Week', 'fantasy_points_ppr': 'Points', 'total_epa': 'EPA', 'opponent_team': 'Opponent'
    })
    
    return p_df

def calculate_boom_bust(df):
    stats = df.groupby(['player_display_name', 'position', 'recent_team']).agg(
        Total_Games=('week', 'count'),
        Avg_Points=('fantasy_points_ppr', 'mean'),
        Max_Points=('fantasy_points_ppr', 'max')
    ).reset_index()
    
    booms = df[df['fantasy_points_ppr'] >= 25].groupby('player_display_name')['week'].count().reset_index(name='Boom_Weeks')
    busts = df[df['fantasy_points_ppr'] < 8].groupby('player_display_name')['week'].count().reset_index(name='Bust_Weeks')
    
    stats = stats.merge(booms, on='player_display_name', how='left').fillna(0)
    stats = stats.merge(busts, on='player_display_name', how='left').fillna(0)
    stats = stats[stats['Total_Games'] >= 5]
    
    # Recalc EPA
    df['total_epa_raw'] = df['passing_epa'] + df['rushing_epa'] + df['receiving_epa']
    epa_real = df.groupby('player_display_name')['total_epa_raw'].mean().reset_index(name='Real_Avg_EPA')
    stats = stats.merge(epa_real, on='player_display_name', how='left')
    
    return stats


# ==========================================
#             PAGE 1: LANDING PAGE
# ==========================================
def render_landing_page(loaded_year):
    # Hero Section
    st.title("🏈 Fantasy Edge Pro")
    st.caption(f"Powered by NFLverse Data | Season {loaded_year}")
    
    st.markdown("### Stop Guessing. Start Winning.")
    st.markdown("""
    Most fantasy players look at "Total Points." **You are better than that.** Use this tool to find the hidden stats that actually matter:
    """)
    
    col1, col2, col3 = st.columns(3)
    with col1:
        st.info("📊 **EPA (Efficiency)**")
        st.markdown("Is a player actually good, or did they just get lucky with a 1-yard TD? EPA tells the truth.")
    with col2:
        st.info("🛡️ **Defensive Splits**")
        st.markdown("Don't just see 'Rank 15.' See if a defense is elite vs the Run but terrible vs the Pass.")
    with col3:
        st.info("💣 **Boom/Bust Radar**")
        st.markdown("Identify the 'League Winners' (25+ pts) and the 'Lineup Killers' (<8 pts) instantly.")

    st.divider()
    
    # Call to Action
    st.markdown("#### 👈 Select 'Deep Dive Tool' in the sidebar to begin.")
    
    # Fun Stat Teaser (Show a random top player)
    st.subheader("🔥 Player Spotlight")
    if not weekly_df.empty:
        top_player = weekly_df.groupby('player_display_name')['fantasy_points_ppr'].sum().idxmax()
        st.success(f"Current Season Leader: **{top_player}**")


# ==========================================
#             PAGE 2: DEEP DIVE TOOL
# ==========================================
def render_deep_dive_page(weekly_df, loaded_year):
    st.title(f"🔎 Deep Dive Tool ({loaded_year})")
    
    # Legend
    with st.expander("📖 READ ME: Metric Key", expanded=False):
        k1, k2, k3, k4, k5 = st.columns(5)
        with k1:
            st.markdown("**EPA**")
            st.caption("Efficiency Rating.")
        with k2:
            st.markdown("**Pass Def**")
            st.caption("1 (Red)=Hard, 32 (Green)=Easy.")
        with k3:
            st.markdown("**Rush Def**")
            st.caption("1 (Red)=Hard, 32 (Green)=Easy.")
        with k4:
            st.markdown("**Boom**")
            st.caption("> 25 Points.")
        with k5:
            st.markdown("**Bust**")
            st.caption("< 8 Points.")

    # Search
    all_players = sorted(weekly_df['player_display_name'].unique())
    default_ix = all_players.index("CeeDee Lamb") if "CeeDee Lamb" in all_players else 0

    col_search, col_stats = st.columns([1, 3])

    with col_search:
        st.subheader("Player Search")
        player = st.selectbox("Select Player", all_players, index=default_ix)
        df_player = get_player_metrics(weekly_df, player)
        
        if df_player is not None:
            avg_pts = df_player['Points'].mean()
            avg_epa = df_player['EPA'].mean()
            st.divider()
            st.metric("Avg Points", f"{avg_pts:.1f}")
            st.metric("Avg EPA", f"{avg_epa:.2f}")

    with col_stats:
        if df_player is not None:
            st.subheader(f"Season Log: {player}")
            
            def color_rank(val):
                if isinstance(val, (float, int)):
                    if val <= 8: return 'background-color: #ffcccc; color: black'
                    if val >= 25: return 'background-color: #ccffcc; color: black'
                return ''

            st.dataframe(
                df_player[['Week', 'Opponent', 'Points', 'EPA', 'Pass Def Rank', 'Rush Def Rank']]
                .style.applymap(color_rank, subset=['Pass Def Rank', 'Rush Def Rank'])
                .format({'Points': '{:.1f}', 'EPA': '{:.2f}', 'Pass Def Rank': '{:.0f}', 'Rush Def Rank': '{:.0f}'}),
                use_container_width=True, hide_index=True
            )
            
            chart = alt.Chart(df_player).mark_circle(size=120).encode(
                x=alt.X('Pass Def Rank', title='Pass Def Rank (32=Easy)'),
                y=alt.Y('Points', title='Fantasy Points'),
                color=alt.Color('Pass Def Rank', scale=alt.Scale(scheme='redyellowgreen'), legend=None),
                tooltip=['Week', 'Opponent', 'Points', 'Pass Def Rank', 'Rush Def Rank']
            ).interactive()
            st.altair_chart(chart, use_container_width=True)

    # Boom/Bust Section
    st.divider()
    st.header("🔥 The Boom/Bust Radar")
    
    all_stats = calculate_boom_bust(weekly_df)
    col_boom, col_bust = st.columns(2)

    with col_boom:
        st.subheader("🚀 Boom Squad (>25 pts)")
        boom_df = all_stats.sort_values(by='Boom_Weeks', ascending=False).head(10)
        st.dataframe(
            boom_df[['player_display_name', 'position', 'Boom_Weeks', 'Max_Points', 'Real_Avg_EPA']]
            .rename(columns={'player_display_name': 'Name', 'Real_Avg_EPA': 'EPA', 'Max_Points': 'High Score'})
            .style.background_gradient(cmap='Greens', subset=['Boom_Weeks'])
            .format({'EPA': '{:.2f}', 'High Score': '{:.1f}', 'Boom_Weeks': '{:.0f}'}),
            use_container_width=True, hide_index=True
        )

    with col_bust:
        st.subheader("📉 Bust Watch (<8 pts)")
        bust_candidates = all_stats[all_stats['Avg_Points'] > 10]
        bust_df = bust_candidates.sort_values(by='Bust_Weeks', ascending=False).head(10)
        st.dataframe(
            bust_df[['player_display_name', 'position', 'Bust_Weeks', 'Avg_Points', 'Real_Avg_EPA']]
            .rename(columns={'player_display_name': 'Name', 'Real_Avg_EPA': 'EPA', 'Avg_Points': 'Avg Score'})
            .style.background_gradient(cmap='Reds', subset=['Bust_Weeks'])
            .format({'EPA': '{:.2f}', 'Avg Score': '{:.1f}', 'Bust_Weeks': '{:.0f}'}),
            use_container_width=True, hide_index=True
        )


# ==========================================
#           MAIN APP CONTROLLER
# ==========================================

# 1. Initialize Data
if not os.path.exists(FILE_PATH):
    if not download_master_file(): st.stop()

weekly_df, loaded_year = load_data_from_disk()
if weekly_df.empty: st.stop()

# 2. Sidebar Navigation
st.sidebar.title("Navigation")
page = st.sidebar.radio("Go to:", ["🏠 Home", "🔎 Deep Dive Tool"])

# 3. Route to Page
if page == "🏠 Home":
    render_landing_page(loaded_year)
elif page == "🔎 Deep Dive Tool":
    render_deep_dive_page(weekly_df, loaded_year)