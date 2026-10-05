import './globals.css';

export const metadata = {
  title: 'typehybrid | Typing Mastery Studio',
  description: 'Monkeytype Analytics × Typing Study Curriculum',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="antialiased bg-[#212224] text-[#d1d0c5] selection:bg-[#e2b714]/30 selection:text-[#e2b714]">
        {children}
      </body>
    </html>
  );
}