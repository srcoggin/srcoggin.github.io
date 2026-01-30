import streamlit as st
from utils import load_data_from_disk, render_theme_toggle
from tabs import fantasy_home, boom_bust, deep_dive

st.set_page_config(layout="wide", page_title="Fantasy Football Hub")

# Theme toggle (top right)
render_theme_toggle()

# 1. LOAD DATA (Global)
all_data_df = load_data_from_disk()
if all_data_df.empty:
    st.error("Data loading failed.")
    st.stop()

st.title(f"🏈 Fantasy Football Hub")

# 2. CREATE TABS
tab_home, tab_data, tab_deep = st.tabs(["🏠 Fantasy Home", "📊 Fantasy Radar", "🔎 Deep Dive Tool"])

# 3. RENDER TABS (Pass the FULL dataset, let tabs handle filtering)
with tab_home:
    fantasy_home.render(all_data_df)

with tab_data:
    boom_bust.render(all_data_df)

with tab_deep:
    deep_dive.render(all_data_df)