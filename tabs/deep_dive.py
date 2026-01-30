import streamlit as st
import altair as alt
import pandas as pd
from utils import (
    get_player_metrics, 
    get_player_profile, 
    render_year_selector,
    safe_get,
    format_height,
    format_weight,
    get_headshot_path
)

def render(all_data_df):

    # --- YEAR SELECTOR ---
    selected_year = render_year_selector(all_data_df, "dd")

    # Filter Data
    weekly_df = all_data_df[all_data_df['season'] == selected_year].copy()
    
    # Prepare Data Globals
    available_pos = sorted(weekly_df['position'].unique())
    
    # --- PRE-CALCULATIONS ---
    avg_map = weekly_df.groupby('player_display_name')['fantasy_points_ppr'].mean().round(1)
    weekly_df['avg_ppg'] = weekly_df['player_display_name'].map(avg_map).fillna(0.0)

    weekly_df['raw_total_epa'] = weekly_df['passing_epa'] + weekly_df['rushing_epa'] + weekly_df['receiving_epa']
    epa_map = weekly_df.groupby('player_display_name')['raw_total_epa'].mean().round(2)
    weekly_df['avg_total_epa'] = weekly_df['player_display_name'].map(epa_map).fillna(0.0)

    games_map = weekly_df.groupby('player_display_name')['week'].count()
    weekly_df['games_played'] = weekly_df['player_display_name'].map(games_map).fillna(0)

    weekly_df['search_label'] = (
        weekly_df['player_display_name'] + 
        " (" + weekly_df['position'] + ") - " + 
        weekly_df['avg_ppg'].astype(str) + " PPG"
    )

    # --- MAIN LAYOUT ---
    st.subheader("🔎 Deep Dive Tool")
    
    col_left, col_right = st.columns([1, 2.5], gap="large")

    # --- LEFT COLUMN: CONTROLS ---
    with col_left:
        # 1. Metric Key
        with st.expander("📖 Metric Key", expanded=False):
            st.info("📊 **EPA**: Efficiency (>0 good)")
            st.info("🛡️ **Def**: Red=Tough, Green=Easy")
            st.info("💣 **Boom/Bust**: High Ceiling/Floor")

        # 2. Filter Positions
        st.markdown("---")
        st.markdown("**Filter Positions**")
        st.caption("Check the boxes to view positions")
        
        # Select All Logic
        for pos in available_pos:
            if f"chk_dd_{pos}" not in st.session_state:
                st.session_state[f"chk_dd_{pos}"] = True

        def toggle_all():
            if st.session_state.dd_select_all:
                for p in available_pos:
                    st.session_state[f"chk_dd_{p}"] = True

        st.checkbox("Select All", value=True, key="dd_select_all", on_change=toggle_all)

        pos_cols = st.columns(2)
        selected_positions = []
        for i, pos in enumerate(available_pos):
            col_idx = i % 2
            with pos_cols[col_idx]:
                if st.checkbox(pos, key=f"chk_dd_{pos}"):
                    selected_positions.append(pos)

        # 3. Sort
        st.markdown("**Sort By**")
        st.caption("Sort by various ranges of metrics")
        sort_method = st.selectbox(
            "Sort By", 
            ["Alphabetical (A-Z)", "Highest PPG", "Highest EPA", "Lowest EPA"],
            label_visibility="collapsed",
            key="dd_sort"
        )

        st.markdown("---")

        # 4. Search
        st.subheader("Player Search")
        
        subset_df = weekly_df[weekly_df['position'].isin(selected_positions)].copy()
        
        unique_players = subset_df[['player_display_name', 'search_label', 'avg_ppg', 'avg_total_epa', 'games_played', 'position']].drop_duplicates()

        if sort_method == "Highest PPG":
            unique_players = unique_players[ (unique_players['position'] != 'K') | (unique_players['games_played'] >= 11) ]
            unique_players = unique_players.sort_values(by='avg_ppg', ascending=False)
        elif sort_method == "Highest EPA":
            unique_players = unique_players[unique_players['games_played'] >= 11]
            unique_players = unique_players.sort_values(by='avg_total_epa', ascending=False)
        elif sort_method == "Lowest EPA":
            unique_players = unique_players[unique_players['games_played'] >= 11]
            unique_players = unique_players.sort_values(by='avg_total_epa', ascending=True)
        else:
            unique_players = unique_players.sort_values(by='player_display_name', ascending=True)

        all_players_labels = unique_players['search_label'].tolist()
        
        if not all_players_labels:
            st.warning("No players found.")
            selected_label = None
        else:
            selected_label = st.selectbox("Search", all_players_labels, index=0, label_visibility="collapsed")

        # 5. Quick Metrics
        df_player = None
        if selected_label:
            player_row = subset_df[subset_df['search_label'] == selected_label].iloc[0]
            player_name = player_row['player_display_name']
            player_pos = player_row['position']
            
            df_player = get_player_metrics(weekly_df, player_name)
            
            if df_player is not None:
                avg_pts = df_player['Points'].mean()
                avg_epa = df_player['EPA'].mean()
                
                st.write("") 
                with st.container():
                    st.metric(f"Avg Points ({selected_year})", f"{avg_pts:.1f}")
                    if player_pos not in ["K", "DEF"]:
                        st.metric(f"Avg EPA ({selected_year})", f"{avg_epa:.2f}")
                
                # Player Profile Blurb (only for 2025)
                if selected_year == 2025:
                    profile = get_player_profile(player_name, 2025)
                    if profile and 'blurb' in profile:
                        st.markdown("---")
                        st.markdown("#### 📝 Season Summary")
                        st.info(profile['blurb'])

    # --- RIGHT COLUMN: CONTENT ---
    with col_right:
        if selected_label and df_player is not None:
            # 1. BIO HEADER - Get all info from the player's row in the dataframe
            player_bio_row = weekly_df[weekly_df['player_display_name'] == player_name].iloc[0]
            
            _, c_img, c_bio = st.columns([0.1, 1, 4], vertical_alignment="bottom")
            
            with c_img:
                headshot_path = get_headshot_path(player_name, player_pos)
                st.image(headshot_path, width=350) 

            with c_bio:
                st.subheader(f"{player_name} ({player_pos})")
                
                # Extract bio data using helper functions
                jersey_val = safe_get(player_bio_row, 'jersey_number')
                jersey = str(int(jersey_val)) if jersey_val != "-" else "-"
                team = safe_get(player_bio_row, 'recent_team')
                height = format_height(safe_get(player_bio_row, 'height', None))
                weight = format_weight(safe_get(player_bio_row, 'weight', None))
                college = safe_get(player_bio_row, 'college_name')
                
                st.markdown(f"**{team}** | #{jersey} | {height} | {weight} | {college}")

            st.divider()

            # 2. GRAPH
            chart = alt.Chart(df_player).mark_circle(size=100).encode(
                x=alt.X('Week', title='Week'),
                y=alt.Y('Points', title='Fantasy Points'),
                tooltip=['Week', 'Opponent', 'Points']
            ).interactive()
            st.altair_chart(chart, use_container_width=True)

            # Calculate Auto-Height (Rows * 35px + Header Buffer)
            # This ensures no scrollbar for the season tables
            n_rows = len(df_player)
            table_height = (n_rows + 1) * 35 + 3

            # 3. TABLE 1: MATCHUP & EFFICIENCY
            if player_pos != "K":
                st.caption("Matchup Efficiency")
                matchup_cols = ['Week', 'Opponent', 'Points', 'EPA', 'Pass Def Rank', 'Rush Def Rank']
                safe_matchup_cols = [c for c in matchup_cols if c in df_player.columns]
                
                def color_rank(val):
                    if isinstance(val, (float, int)):
                        if val <= 8: return 'background-color: #ffcccc; color: black'
                        if val >= 25: return 'background-color: #ccffcc; color: black'
                    return ''
                
                st.dataframe(
                    df_player[safe_matchup_cols]
                    .style.map(color_rank, subset=['Pass Def Rank', 'Rush Def Rank'])
                    .format({'Points': '{:.1f}', 'EPA': '{:.2f}', 'Pass Def Rank': '{:.0f}', 'Rush Def Rank': '{:.0f}'}),
                    use_container_width=True, 
                    hide_index=True,
                    height=table_height
                )

            # 4. TABLE 2: SMART BOX SCORE (Dynamic Columns)
            st.caption("Weekly Box Score")
            
            # -- SMART COLUMN LOGIC --
            pass_cols = ['Pass Yds', 'Pass TD', 'Int']
            rush_cols = ['Rush Yds', 'Rush TD']
            rec_cols = ['Tgt', 'Rec', 'Rec Yds', 'Rec TD']
            kick_cols = ['FG M', 'FG A', 'FG%', 'PAT M', 'PAT A', 'PAT%']
            
            # Check Activity (Season Sum > 0)
            has_passing = df_player['Pass Yds'].abs().sum() > 0 or df_player['Pass TD'].abs().sum() > 0
            has_rushing = df_player['Rush Yds'].abs().sum() > 0 or df_player['Rush TD'].abs().sum() > 0
            has_receiving = df_player['Rec Yds'].abs().sum() > 0 or df_player['Rec'].abs().sum() > 0

            spec_cols = []
            
            if player_pos == "QB":
                spec_cols += pass_cols + rush_cols
                if has_receiving: spec_cols += rec_cols
                
            elif player_pos in ["RB", "FB"]:
                spec_cols += rush_cols + rec_cols
                if has_passing: spec_cols += pass_cols
                
            elif player_pos in ["WR", "TE"]:
                spec_cols += rec_cols
                if has_rushing: spec_cols += rush_cols
                if has_passing: spec_cols += pass_cols
                
            elif player_pos == "K":
                spec_cols += kick_cols
                
            # -- RENDER --
            box_cols = ['Week', 'Opponent', 'Points'] + spec_cols
            safe_box_cols = [c for c in box_cols if c in df_player.columns]

            format_dict = {
                'Points': '{:.1f}', 'FG%': '{:.1f}%', 'PAT%': '{:.1f}%',
                'Pass Yds': '{:.0f}', 'Rush Yds': '{:.0f}', 'Rec Yds': '{:.0f}',
                'Pass TD': '{:.0f}', 'Rush TD': '{:.0f}', 'Rec TD': '{:.0f}',
                'Int': '{:.0f}', 'Rec': '{:.0f}', 'Tgt': '{:.0f}', 
                'FG M': '{:.0f}', 'FG A': '{:.0f}', 'PAT M': '{:.0f}'
            }
            
            st.dataframe(
                df_player[safe_box_cols].style.format(format_dict, na_rep="-"),
                use_container_width=True, 
                hide_index=True,
                height=table_height # <--- Auto-Expanded Height
            )