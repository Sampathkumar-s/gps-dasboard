# 🚀 Quick Start Guide - Fleet GPS Tracking System

## ⚡ 60-Second Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open in Browser
```
http://localhost:5173
```

**That's it!** Your GPS Dashboard is now running. 🎉

---

## 📋 What You'll See

### 1. Sidebar (Left)
- List of 5 vehicles
- Online/Offline status
- Vehicle count
- Click to select vehicle

### 2. Map (Center)
- Interactive canvas map
- Vehicle markers
- Zoom controls
- Pan by dragging

### 3. Details Panel (Bottom)
- Selected vehicle information
- GPS coordinates
- Status badge
- Last update time

---

## 🎮 Basic Usage

### Select a Vehicle
1. Click any vehicle in the sidebar
2. Vehicle highlights in blue
3. Map centers on vehicle
4. Details panel updates

### Navigate the Map
- **Scroll Mouse Wheel** → Zoom in/out
- **Click and Drag** → Pan the map
- **Zoom Buttons** → (+) and (-) buttons

### Watch Real-time Updates
- Markers update every 5 seconds
- Status changes after 10 seconds without update
- "Last Update" time shows on details panel

---

## 📊 Sample Fleet Data

The system comes with 5 mock vehicles:

| Vehicle | Status | Location |
|---------|--------|----------|
| TRUCK-001 | Online ✅ | London, UK |
| VAN-002 | Online ✅ | London, UK |
| BUS-003 | Offline ❌ | London, UK |
| CAR-004 | Online ✅ | London, UK |
| TRUCK-005 | Offline ❌ | London, UK |

---

## 🛠️ Common Commands

### Development
```bash
npm run dev       # Start dev server
```

### Production
```bash
npm run build     # Create optimized build
npm run preview   # Preview production build
```

### Code Quality
```bash
npm run lint      # Check code quality
```

---

## 🔌 Connect Your Backend

To connect real GPS data:

**See**: `API_INTEGRATION.md`

Quick options:
1. **REST API** - Easiest
2. **WebSocket** - Real-time
3. **Firebase** - Cloud-hosted
4. **MQTT** - IoT native

---

## 📱 Responsive Design

The dashboard works on:
- ✅ **Desktop** (1920x1080+)
- ✅ **Tablet** (768x1024)
- ✅ **Mobile** (320x568)

Try resizing your browser!

---

## 🧪 Test Cases

### Test 1: Vehicle Selection
✅ Click vehicle → Verify highlight and map center

### Test 2: Map Controls
✅ Zoom and pan → Verify smooth interaction

### Test 3: Status Updates
✅ Wait 10 seconds → Verify status changes to Offline

### Test 4: Real-time Updates
✅ Watch markers → Verify smooth movement

---

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173
lsof -i :5173
kill -9 <PID>

# Then try again
npm run dev
```

### Build Fails
```bash
# Clear cache and reinstall
rm -rf node_modules dist
npm install
npm run build
```

### Map Not Showing
- Check browser console for errors
- Ensure JavaScript is enabled
- Try hard refresh (Ctrl+Shift+R)

---

## 📚 Learn More

For detailed information, see:

- **README.md** - Full feature list and setup
- **ARCHITECTURE.md** - System design and patterns
- **API_INTEGRATION.md** - Backend integration guide
- **DEPLOYMENT.md** - Production deployment
- **PROJECT_SUMMARY.md** - Complete overview

---

## 🎯 Next Steps

### 1. Explore the Code
- Open `src/App.tsx` to see state management
- Check `src/Sidebar.jsx` for vehicle list
- Review `src/MapView.jsx` for map rendering

### 2. Customize
- Change colors in `src/index.css`
- Modify mock data in `src/data/gpsData.js`
- Update vehicle details in details panel

### 3. Integrate Backend
- Follow `API_INTEGRATION.md`
- Replace mock service with real API
- Add authentication if needed

### 4. Deploy
- Follow `DEPLOYMENT.md`
- Choose hosting platform (Vercel, AWS, etc.)
- Configure environment variables

---

## 📞 Need Help?

### Documentation
- 📖 README.md - Complete documentation
- 🏗️ ARCHITECTURE.md - System architecture
- 🔌 API_INTEGRATION.md - Backend integration
- 🚀 DEPLOYMENT.md - Production deployment

### Common Issues
- Port in use? → Kill the process
- Build error? → Clear node_modules
- Map not showing? → Check console
- Vehicle not updating? → Verify timestamp logic

---

## ✅ Verification Checklist

After starting the app, verify:

- [ ] Sidebar shows 5 vehicles
- [ ] Map displays properly
- [ ] Can click to select vehicle
- [ ] Map centers on selected vehicle
- [ ] Details panel shows vehicle info
- [ ] Status badge shows Online/Offline
- [ ] Markers update smoothly
- [ ] No console errors

---

## 🎉 You're Ready!

Your professional Fleet GPS Tracking System is up and running. 

**What to do now:**
1. Explore the features
2. Understand the code
3. Customize for your needs
4. Integrate your backend
5. Deploy to production

---

**Happy tracking! 🚗📍**

---

*For comprehensive documentation, see PROJECT_SUMMARY.md*
