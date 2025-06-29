# CSS Clamp Calculator

🎯 **Create perfect responsive values for modern web development**

A powerful, intuitive tool for generating CSS `clamp()` functions with real-time preview and advanced project management features.

## 🚀 [Live Demo](https://hasenov.github.io/clamp-calculator/)

## ✨ Features

- **🎨 Real-time Preview** - See your clamp values in action instantly
- **📋 One-click Copy** - Copy generated CSS with a single click
- **💾 Project Management** - Save and organize your clamp configurations
- **📤📥 Import/Export Projects** - Import and export your projects as JSON files
- **⚙️ Flexible Units** - Support for rem, px, and em units
- **🔄 Px to Rem Conversion** - Input values in px, but generate clamp() with rem units for better accessibility
- **🎯 Viewport Control** - Customize min/max screen widths
- **⚡ Lightning Fast** - Built with Vue.js and TypeScript for optimal performance

## 🛠️ How It Works

1. **Set Your Range** - Define minimum and maximum viewport widths
2. **Choose Values** - Set your desired minimum and maximum values
3. **Select Units** - Pick from rem, px, or em units
4. **Get Your Code** - Copy the generated `clamp()` function
5. **Use in CSS** - Apply directly to your stylesheets

## 📖 Understanding CSS Clamp

The `clamp()` function takes three parameters:

```css
clamp(minimum, preferred, maximum)
```

The calculator generates the perfect `preferred` value using linear interpolation between your viewport breakpoints, ensuring smooth scaling across all screen sizes.

## 🎯 Use Cases

- **Typography** - Responsive font sizes that scale naturally
- **Spacing** - Margins and paddings that adapt to screen size
- **Layout** - Container widths and component sizing
- **Design System** - Consistent scaling across your entire project

## 🛠️ Tech Stack

- **Vue.js 3** - Modern reactive framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Lightning-fast build tool
- **PrimeVue** - Rich UI component library

## Project Setup

```
npm install
```

**Compile and Hot-Reload for Development**

```
npm run dev
```

**Type-Check, Compile and Minify for Production**

```
npm run build
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

**Hasenov** - [@hasenov](https://github.com/hasenov)

---

⭐ **Star this repo if it helped you!** ⭐
