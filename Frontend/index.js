import { registerRootComponent } from 'expo';

import App from './App';

// Helper to show a clear runtime error message in the browser
function showRuntimeError(message) {
	const full = 'Frontend runtime is not ready. ' + message;
	if (typeof document !== 'undefined') {
		// replace page with a visible error block for web
		document.body.innerHTML = `
			<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial;display:flex;align-items:center;justify-content:center;height:100vh;background:#fff;color:#222;">
				<div style="max-width:720px;padding:24px;border:1px solid #eee;border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,0.08);">
					<h1 style="margin:0 0 8px;font-size:20px;color:#c0392b;">Frontend runtime not ready</h1>
					<p style="margin:0;color:#444;">${full}</p>
				</div>
			</div>
		`;
	} else if (typeof console !== 'undefined') {
		console.error(full);
	}
}

try {
	if (!App) throw new Error('App module missing');
	// registerRootComponent calls AppRegistry.registerComponent('main', () => App)
	// It also ensures that whether you load the app in Expo Go or in a native build,
	// the environment is set up appropriately
	registerRootComponent(App);
} catch (err) {
	showRuntimeError(err && err.message ? err.message : String(err));
}
