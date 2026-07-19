# React + TypeScript + Vite

<pre>
src/
├── assets/          # Static files (images, global fonts)
├── components/      # All React components
│   ├── ui/          # "Dumb" reusable components (buttons, inputs, cards - e.g., shadcn)
│   └── dashboard/   # Feature-specific components (charts, metric cards)
├── hooks/           # Custom React hooks (e.g., useSensorData)
├── layouts/         # Page wrappers (e.g., DashboardLayout with Sidebar/Header)
├── lib/             # Pure utility functions (no React code here)
│   ├── api/         # Axios/Fetch instances and endpoint definitions
│   └── utils/       # Formatters, helpers, cn()
├── pages/           # Main route components (e.g., Overview, Settings)
├── types/           # Global TypeScript interfaces and types
├── App.tsx          # Root component (Routing wrapper)
└── main.tsx         # Application entry point
</pre>