import streamlit as st
import base64
from utils import render_theme_toggle

st.set_page_config(layout="wide", page_title="The Expert Football", page_icon="🏈")

# Theme toggle (top right)
render_theme_toggle()

# --- HERO SECTION ---
def get_base64_image(image_path):
    try:
        with open(image_path, "rb") as img_file:
            return base64.b64encode(img_file.read()).decode()
    except FileNotFoundError:
        return ""

img_base64 = get_base64_image("Logo.png")

if img_base64:
    st.markdown(
        f"""
        <style>
        .header-container {{ display: flex; flex-direction: row; align_items: center; }}
        .logo-img {{ width: 100px; height: auto; margin-right: 15px; }}
        .header-text {{ margin: 0; padding: 0; line-height: 1; margin-top: 5px; }}
        </style>
        <div class="header-container">
            <img src="data:image/png;base64,{img_base64}" class="logo-img">
            <h1 class="header-text">The Expert Football</h1>
        </div>
        """,
        unsafe_allow_html=True
    )
else:
    st.title("The Expert Football")

st.caption("Your Hub for Advanced Sports Analytics")

st.divider()

# --- NEWS & UPDATES SECTION ---
col_news, col_updates = st.columns(2)

with col_news:
    st.header("📰 Latest News")
    st.info("📅 **Feb 2026:** 2024 Season Data is now fully finalized.")
    st.write("• **New Feature:** Boom/Bust Radar now supports position filtering.")
    st.write("• **Data Update:** Corrected EPA calculations for Week 14.")
    st.write("• **Community:** Join our Discord to request new stats!")

with col_updates:
    st.header("🛠️ System Status")
    st.success("✅ **NFL Database:** Online")
    st.success("✅ **Calculation Engine:** Operational")
    st.warning("⚠️ **Maintenance:** Scheduled for Tuesday 3 AM EST")
    
    if st.button("🔄 Force Update Data"):
        import os
        if os.path.exists("nfl_data_master.parquet"):
            os.remove("nfl_data_master.parquet")
        st.cache_resource.clear()
        st.success("Data cache cleared! Refresh the page to download the latest stats.")

st.divider()
st.markdown("### 🏈 Ready to analyze?")
st.markdown("#### 👈 Click **'Fantasy Football'** in the sidebar to access the tools.")