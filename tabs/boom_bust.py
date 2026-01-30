import streamlit as st
from utils import calculate_boom_bust

def render(all_data_df):
    # --- YEAR SELECTOR (Squashed Layout) ---
    available_years = sorted(all_data_df['season'].unique(), reverse=True)
    
    # Unique key 'bb_year' prevents conflict with other tabs
    col_year, col_spacer = st.columns([2, 10])
    with col_year:
        selected_year = st.selectbox("📅 Select Season", available_years, index=0, key="bb_year")
        
    # Filter Data
    df = all_data_df[all_data_df['season'] == selected_year].copy()

    # --- MAIN CONTENT ---
    st.header(f"🔥 The Boom/Bust Radar ({selected_year})")
    st.caption("Identify League Winners (>25 pts) and Lineup Killers (<8 pts).")
    st.divider()

    # --- POSITION FILTER (DROPDOWN) ---
    st.markdown("**Filter Positions:**")
    filter_options = ["ALL POSITIONS", "QB", "WR", "RB", "TE", "FB"]
    col_select, col_spacer = st.columns([2, 10])
    with col_select:
        selected_pos = st.selectbox("Select Position", filter_options, index=0, label_visibility="collapsed", key="bb_pos")

    # Filter Logic
    if selected_pos == "ALL POSITIONS":
        target_positions = ["QB", "WR", "RB", "TE", "FB"]
        subset_df = df[df['position'].isin(target_positions)]
    else:
        subset_df = df[df['position'] == selected_pos]

    if subset_df.empty:
        st.warning(f"No data found for {selected_pos} in {selected_year}.")
        return

    # --- CALCULATE ---
    all_stats = calculate_boom_bust(subset_df)
    col_boom, col_bust = st.columns(2)

    with col_boom:
        st.subheader("🚀 Boom Squad (>25 pts)")
        if not all_stats.empty:
            boom_df = all_stats.sort_values(by='Boom_Weeks', ascending=False).head(15)
            st.dataframe(
                boom_df[['player_display_name', 'position', 'Boom_Weeks', 'Max_Points', 'Real_Avg_EPA']]
                .rename(columns={'player_display_name': 'Name', 'Real_Avg_EPA': 'EPA', 'Max_Points': 'High Score'})
                .style.background_gradient(cmap='Greens', subset=['Boom_Weeks'])
                .format({'EPA': '{:.2f}', 'High Score': '{:.1f}', 'Boom_Weeks': '{:.0f}'}),
                use_container_width=True, hide_index=True
            )

    with col_bust:
        st.subheader("📉 Bust Watch (<8 pts)")
        if not all_stats.empty:
            bust_candidates = all_stats[all_stats['Avg_Points'] > 10]
            if not bust_candidates.empty:
                bust_df = bust_candidates.sort_values(by='Bust_Weeks', ascending=False).head(15)
                st.dataframe(
                    bust_df[['player_display_name', 'position', 'Bust_Weeks', 'Avg_Points', 'Real_Avg_EPA']]
                    .rename(columns={'player_display_name': 'Name', 'Real_Avg_EPA': 'EPA', 'Avg_Points': 'Avg Score'})
                    .style.background_gradient(cmap='Reds', subset=['Bust_Weeks'])
                    .format({'EPA': '{:.2f}', 'Avg Score': '{:.1f}', 'Bust_Weeks': '{:.0f}'}),
                    use_container_width=True, hide_index=True
                )