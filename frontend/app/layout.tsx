// app/layout.tsx
import "./globals.css";
import HeaderComponent from "../components/public/header";
import AuthProvider from "../contexts/authContext";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <HeaderComponent />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
