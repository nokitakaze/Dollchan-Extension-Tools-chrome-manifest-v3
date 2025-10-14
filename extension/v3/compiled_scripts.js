/* eslint-disable */
export const compiledScripts = [];

compiledScripts["injection1"] = () => {
window.FormData = void 0;
};

compiledScripts["injection2"] = () => {
highlightReply = Function.prototype;
};

compiledScripts["injection3"] = () => {
reloadCaptcha();
};

compiledScripts["injection4"] = () => {
if("autoRefresh" in window) {
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
				}
};

compiledScripts["injection5"] = () => {
Captcha.init(); Captcha.initForm(document.getElementById("postform"));
};

compiledScripts["injection6"] = () => {
var captchaTimeout = 29.5; Captcha.state = "init";
};

compiledScripts["injection8"] = () => {
loadCapFn();
};

compiledScripts["injection9a"] = () => {
(function() {
				function fixGlobalFunc(name) {
					Object.defineProperty(window, name,
						{ value: Function.prototype, writable: false, configurable: false });
				}
				fixGlobalFunc("linkremover");
				fixGlobalFunc("Media");
				window.FormData = void 0;
			})();
};

compiledScripts["injection9b"] = () => {
(function() {
				function fixGlobalFunc(name) {
					Object.defineProperty(window, name,
						{ value: Function.prototype, writable: false, configurable: false });
				}
				fixGlobalFunc("autorefresh_start");
				fixGlobalFunc("linkremover");
				fixGlobalFunc("Media");
				window.FormData = void 0;
			})();
};

compiledScripts["injection10"] = () => {
postFormSubmit = Function.prototype;
};

compiledScripts["injection11"] = () => {
initTCaptcha();
};

compiledScripts["injection12"] = () => {
setTimeout(function() {
					const element = document.getElementById("de-panel-info-posters");
					if (element === null) return;
					element.textContent = window.unique_ips || "";
				}, 0)
};

compiledScripts["injection14"] = () => {
captchaUtils.reloadCaptcha();
};

compiledScripts["injection15"] = () => {
load_captcha("/vichan/inc/captcha/entrypoint.php", "abcdefghijklmnopqrstuvwxyz");
};

compiledScripts["injection16"] = () => {
highlight = Function.prototype;
};

compiledScripts["injection17"] = () => {
load_captcha("/inc/captcha/entrypoint.php", "abcdefghijklmnopqrstuvwxyz");
				actually_load_captcha("/inc/captcha/entrypoint.php", "abcdefghijklmnopqrstuvwxyz");
};

compiledScripts["injection18"] = () => {
$("textarea#body").on("change input propertychange", countSymbols); countSymbols();
};

