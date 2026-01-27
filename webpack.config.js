/**
 * Webpack Configuration for PolyMetrics Chrome Extension
 * 
 * This configuration handles the build process for the extension:
 * 1. Entry Points: Defines 'background' (service worker) and 'styles' (CSS) entries.
 * 2. Output: Bundles assets into the 'PolyMetrics' directory.
 * 3. Modules: Uses loaders to process CSS files.
 * 4. Optimization: Minifies JS (Terser) and CSS (CssMinimizer) for production, removing comments and console logs.
 * 5. Plugins:
 *    - MiniCssExtractPlugin: Extracts CSS into a separate file.
 *    - CopyWebpackPlugin: Copies static assets (icons, pages, manifest, etc.) to the build folder, ignoring unnecessary files.
 *    - IconGeneratorPlugin (Custom): Runs a shell script to generate icons before the build.
 *    - CleanupPlugin (Custom): Cleans up the build directory after compilation (removes temporary files like .DS_Store, .git, etc.).
 */

const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const { execSync } = require('child_process');

module.exports = {
    entry: {
        // Define entry points; keys will be used as output bundle names
        background: './src/background.js', // For JavaScript service worker
        styles: './assets/css/styles.css', // For CSS
    },
    output: {
        filename: '[name].js', // Output filename, [name] is replaced by entry key
        path: path.resolve(__dirname, 'PolyMetrics') // Output directory
    },
    module: {
        rules: [
            {
                test: /\.css$/, // Loader for CSS files
                use: [
                    MiniCssExtractPlugin.loader, // Extract CSS from JS bundle
                    'css-loader' // Handle @import and url() in CSS
                ]
            }
        ]
    },
    mode: 'production', // Build mode set to production for optimization and minification
    optimization: {
        minimize: true, // Enable minimization
        minimizer: [
            new CssMinimizerPlugin(), // CSS optimization plugin
            new TerserPlugin({
                terserOptions: {
                    format: {
                        comments: false, // Remove all comments
                        beautify: false, // Ensure output is compressed
                    },
                    compress: {
                        drop_console: true, // Remove all console.* statements
                        drop_debugger: true, // Remove all debugger statements
                    },
                    mangle: true, // Variable and function name mangling
                },
                extractComments: false, // Do not extract comments to a separate file
            }),
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'assets/css/styles.css', // Output path and filename for CSS
        }),
        new CopyWebpackPlugin({
            patterns: [
                // Copy files from source directories to output directory
                { 
                    from: 'assets/icons', 
                    to: 'assets/icons', 
                    noErrorOnMissing: true,
                    globOptions: {
                        ignore: [
                            '**/.DS_Store',
                            '**/.git*',
                            '**/*.map'
                        ]
                    }
                },
                { 
                    from: 'src/pages', 
                    to: 'pages',
                    globOptions: {
                        ignore: [
                            '**/.DS_Store',
                            '**/.git*',
                            '**/*.map',
                            '**/node_modules/**'
                        ]
                    }
                },
                { from: 'src/scripts.js', to: 'assets/js/scripts.js' },
                { from: 'src/common.js', to: 'assets/js/common.js' },
                { 
                    from: 'assets/css/sweetalert2', 
                    to: 'assets/css/sweetalert2', 
                    noErrorOnMissing: true,
                    globOptions: {
                        ignore: [
                            '**/.DS_Store',
                            '**/.git*',
                            '**/*.map'
                        ]
                    }
                },
                { 
                    from: 'assets/js', 
                    to: 'assets/js', 
                    noErrorOnMissing: true,
                    globOptions: {
                        ignore: [
                            '**/.DS_Store',
                            '**/.git*',
                            '**/*.map',
                            '**/node_modules/**',
                            '**/package.json',
                            '**/package-lock.json'
                        ]
                    }
                },
                { from: 'manifest.json', to: 'manifest.json' },
                { from: 'LICENSE', to: 'LICENSE', noErrorOnMissing: true },
                { 
                    from: 'screenshot',
                    to: 'screenshot',
                    globOptions: {
                        ignore: [
                            '**/icon.png', // Exclude icon.png during copy
                            '**/.DS_Store',
                            '**/.git*'
                        ]
                    },
                    noErrorOnMissing: true
                }
            ],
        }),
        {
            apply: (compiler) => {
                compiler.hooks.beforeRun.tap('IconGeneratorPlugin', () => {
                    console.log('🎨 Running icon generation script...');
                    try {
                        const iconScript = path.resolve(__dirname, 'icon.sh');
                        execSync(`chmod +x "${iconScript}" && "${iconScript}"`, { 
                            stdio: 'inherit',
                            cwd: __dirname 
                        });
                        console.log('✅ Icon generation completed!');
                    } catch (error) {
                        console.warn('⚠️  Icon generation failed (non-critical):', error.message);
                    }
                });
            }
        },
        {
            apply: (compiler) => {
                compiler.hooks.done.tap('CleanupPlugin', () => {
                    console.log('🧹 Cleaning up build directory for Chrome Web Store...');
                    try {
                        const fs = require('fs');
                        const buildDir = path.resolve(__dirname, 'PolyMetrics');
                        
                        // Function to remove unwanted files
                        const removeUnwantedFiles = (dir) => {
                            if (!fs.existsSync(dir)) return;
                            
                            const files = fs.readdirSync(dir, { withFileTypes: true });
                            
                            for (const file of files) {
                                const filePath = path.join(dir, file.name);
                                
                                try {
                                    // Remove .DS_Store files
                                    if (file.name === '.DS_Store') {
                                        fs.unlinkSync(filePath);
                                        console.log(`  ❌ Removed: ${filePath.replace(buildDir, '.')}`);
                                    }
                                    
                                    // Remove .git directory
                                    if (file.isDirectory() && file.name === '.git') {
                                        fs.rmSync(filePath, { recursive: true, force: true });
                                        console.log(`  ❌ Removed: ${filePath.replace(buildDir, '.')}`);
                                    }
                                    
                                    // Remove .gitignore
                                    if (file.name === '.gitignore') {
                                        fs.unlinkSync(filePath);
                                        console.log(`  ❌ Removed: ${filePath.replace(buildDir, '.')}`);
                                    }
                                    
                                // Remove source maps
                                if (file.name.endsWith('.map')) {
                                    fs.unlinkSync(filePath);
                                    console.log(`  ❌ Removed: ${filePath.replace(buildDir, '.')}`);
                                }
                                
                                // Remove styles.js (empty file created by webpack for CSS entry)
                                if (file.name === 'styles.js') {
                                    fs.unlinkSync(filePath);
                                    console.log(`  ❌ Removed: ${filePath.replace(buildDir, '.')}`);
                                }
                                
                                // Recursively process subdirectories
                                if (file.isDirectory() && file.name !== 'node_modules') {
                                    removeUnwantedFiles(filePath);
                                }
                                } catch (err) {
                                    // Ignore errors for individual files
                                }
                            }
                        };
                        
                        removeUnwantedFiles(buildDir);
                        console.log('✅ Cleanup completed! Build is ready for Chrome Web Store submission.');
                    } catch (error) {
                        console.warn('⚠️  Cleanup failed (non-critical):', error.message);
                    }
                });
            }
        }
    ],
};
