# 🌍 CO₂ Emissions Dashboard

This is a web-based dashboard built with **Angular**, **Chart.js**, and **Angular Material** to visualize per capita CO₂ emissions across countries and regions from the year **1900 onwards**. The dashboard provides three main views:
- **Time Series**
- **Regional Comparison**
- **Top & Bottom Emitters**

---

## 🛠 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/mfonette/co2_dashboard.git
cd co2-dashboard
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the App
```bash
ng serve
```

Open in your browser: [http://localhost:4200](http://localhost:4200)

---

## 🗂 Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── services/              # Core logic for loading, filtering, and managing data
│   │   │   └── data.service.ts
│   │   ├── models/                # Data models used throughout the app
│   │   │   └── co2-entity.model.ts
│
│   ├── features/                  # Feature-based component structure
│   │   ├── time-series/           # Line chart comparing CO₂ emissions over time
│   │   ├── regional-comparison/   # Bar chart comparing selected countries and regions
│   │   └── top-bottom-emitters/   # Horizontal diverging bar chart for top/bottom emitters
│
│   ├── layout/                    # UI layout components (header/sidebar)
│   │   ├── header/
│   │   └── sidebar/
│
│   ├── app-routing.module.ts      # Lazy-loaded routes
│   ├── app.component.ts
│   └── app.module.ts
│
├── assets/
│   └── data/co2_emissions.csv     # Main dataset
```

---

## 🧠 Key Design & Architectural Decisions

### 1. **Modular Design**
The app is divided into three feature modules, each lazily loaded for performance.

### 2. **Responsive UI**
The layout and dropdowns adapt to different screen sizes using Bootstrap and Angular Material.

### 3. **Reactive Data Flow**
`DataService` uses `BehaviorSubject` and RxJS `combineLatest` to manage data streams and ensure synchronized updates.

---

## ✅ Assumptions Made

1. **Data Filtering from 1900**  
   The dataset was filtered to exclude years prior to 1900 to reduce visual clutter and improve performance.

2. **Single Entity List for Time Series**  
   All entities (countries + regions) are available in the dropdown for comparison instead of separating them.

3. **Mixed Country & Region Comparison**  
   Regional Comparison allows selecting both countries and regions at once for flexibility.

4. **Top N Emitters = 10**  
   "Top emitters" was interpreted as the top 10 highest and bottom 10 lowest emitters for the selected year.

5. **Maximum Selections**  
   - Time Series: A maximum of 5 entities can be selected at a time.  
   - Regional Comparison: A total of 30 entities (countries + regions combined) can be selected.

6. **Chart Responsiveness**  
   Bar sizes are adjusted based on the number of selected entities to maintain visual balance.