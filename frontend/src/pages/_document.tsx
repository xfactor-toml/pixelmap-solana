import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
    render() {
        return (
            <Html>
                <Head>
                    <link
                        rel="icon"
                        type="image/png"
                        sizes="16x16"
                        href="/static/favicons/logo.png"
                    />
                    <link rel="stylesheet"
                        href="https://fonts.googleapis.com/css2?family=Audiowide&display=swap">
                    </link>

                    <link rel="stylesheet"
                        href="https://fonts.googleapis.com/css2?family=ABeeZee&display=swap">
                    </link>
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}
