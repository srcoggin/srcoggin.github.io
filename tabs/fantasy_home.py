import streamlit as st

def render(all_data_df):
    # 1. Automatically find the latest year
    latest_year = all_data_df['season'].max()
    
    # 2. Filter data for that year
    df = all_data_df[all_data_df['season'] == latest_year]

    st.header("Welcome to the Fantasy Command Center")
    st.caption(f"Showing latest data for the **{latest_year} NFL Season**.")
    
    # Quick high-level stats
    st.divider()
    c1, c2, c3 = st.columns(3)
    
    top_scorer = df.groupby('player_display_name')['fantasy_points_ppr'].sum().idxmax()
    max_pts = df.groupby('player_display_name')['fantasy_points_ppr'].sum().max()
    
    with c1:
        st.metric(f"Top Player of {latest_year}", top_scorer)
    with c2:
        st.metric("Highest Total Points", f"{max_pts:.1f}")
    with c3:
        st.metric("Active Players", df['player_display_name'].nunique())

    st.info("**Select a tool tab above** (Fantasy Radar or Deep Dive Fantasy Tool) to start analyzing players, seasons, or trends.")