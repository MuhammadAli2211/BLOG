
export const metadata = {
    title: "BLOG",
    description: "Next.js Blogging App",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body suppressHydrationWarning>

                {children}

            </body>
        </html>
    );
}