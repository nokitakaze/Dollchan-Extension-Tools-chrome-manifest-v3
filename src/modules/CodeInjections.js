/* ==[ CodeInjections.js ]===================================================================================
=========================================================================================================== */
WORLD_CODE_INJECTIONS = [];
WORLD_CODE_INJECTIONS.injection1 = 'window.FormData = void 0;';
WORLD_CODE_INJECTIONS.injection2 = 'highlightReply = Function.prototype;';
WORLD_CODE_INJECTIONS.injection3 = 'reloadCaptcha();';
WORLD_CODE_INJECTIONS.injection4 = `if("autoRefresh" in window) {
					clearInterval(refreshTimer);
				}
				if("thread" in window) {
					if(thread.refreshTimer) {
						clearInterval(thread.refreshTimer);
						Object.defineProperty(thread, "startTimer",
							{ value: Function.prototype, writable: false, configurable: false });
					}
					Object.defineProperty(thread, "changeRefresh",
						{ value: Function.prototype, writable: false, configurable: false });
				}`;
WORLD_CODE_INJECTIONS.injection5 = 'Captcha.init(); Captcha.initForm(document.getElementById("postform"));';
WORLD_CODE_INJECTIONS.injection6 = 'var captchaTimeout = 29.5; Captcha.state = "init";';
// WORLD_CODE_INJECTIONS.injection7 = '';
WORLD_CODE_INJECTIONS.injection8 = 'loadCapFn();';
WORLD_CODE_INJECTIONS.injection9a = `(function() {
				function fixGlobalFunc(name) {
					Object.defineProperty(window, name,
						{ value: Function.prototype, writable: false, configurable: false });
				}
				fixGlobalFunc("linkremover");
				fixGlobalFunc("Media");
				window.FormData = void 0;
			})();`;
WORLD_CODE_INJECTIONS.injection9b = `(function() {
				function fixGlobalFunc(name) {
					Object.defineProperty(window, name,
						{ value: Function.prototype, writable: false, configurable: false });
				}
				fixGlobalFunc("autorefresh_start");
				fixGlobalFunc("linkremover");
				fixGlobalFunc("Media");
				window.FormData = void 0;
			})();`;
WORLD_CODE_INJECTIONS.injection10 = 'postFormSubmit = Function.prototype;';
WORLD_CODE_INJECTIONS.injection11 = 'initTCaptcha();';
WORLD_CODE_INJECTIONS.injection12 = `setTimeout(function() {
					const element = document.getElementById("de-panel-info-posters");
					if (element === null) return;
					element.textContent = window.unique_ips || "";
				}, 0)`;
// WORLD_CODE_INJECTIONS.injection13 = 'debugger';
WORLD_CODE_INJECTIONS.injection14 = 'captchaUtils.reloadCaptcha();';
WORLD_CODE_INJECTIONS.injection15 =
	'load_captcha("/vichan/inc/captcha/entrypoint.php", "abcdefghijklmnopqrstuvwxyz");';
WORLD_CODE_INJECTIONS.injection16 = 'highlight = Function.prototype;';
WORLD_CODE_INJECTIONS.injection17 = `load_captcha("/inc/captcha/entrypoint.php", "abcdefghijklmnopqrstuvwxyz");
				actually_load_captcha("/inc/captcha/entrypoint.php", "abcdefghijklmnopqrstuvwxyz");`;
WORLD_CODE_INJECTIONS.injection18 = '$("textarea#body").on("change input propertychange", countSymbols); countSymbols();';
