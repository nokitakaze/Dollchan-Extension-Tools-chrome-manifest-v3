/* eslint indent: ["error", "tab", { "outerIIFEBody": 0 }] */
import { compiledScripts } from './compiled_scripts.js';  // импорт именованных экспортов

(function() {
'use strict';
let isEnabled = false;

function getStored(id) {
	// Read storage.local first. If it not existed then read storage.sync
	return new Promise(resolve => chrome.storage.local.get(id, obj => {
		if(Object.keys(obj).length) {
			resolve(obj[id]);
		} else {
			chrome.storage.sync.get(id, obj => resolve(obj[id]));
		}
	}));
}

function setStored(id, value) {
	const obj = {};
	obj[id] = value;
	chrome.storage.sync.set(obj, Function.prototype);
}

function setIcon(enabled) {
	chrome.action.setIcon({ path: `icons/logo-32-light${ enabled ? '' : '-disabled' }.png` });
	chrome.action.setTitle({ title: `Dollchan Extension ${ enabled ? '(enabled)' : '(disabled)' }` });
}

// Installation into pages
const SCOPE_KEY = 'DESU_scope';
const SCRIPT_ID = 'dollchan';

function splitLines(s='') { return s.split(/\r?\n/).map(v=>v.trim()).filter(Boolean); }
// ВАЖНО: тут ожидаются chrome match patterns, не regex.
// Если у вас были произвольные regex — полностью эквивалентно через registerContentScripts не получится.

async function applyScope() {
  const { [SCOPE_KEY]: scope = { includes: '*', excludes: '' } } =
    await chrome.storage.local.get(SCOPE_KEY);

  const toPatterns = arr => arr.map(p => p === '*' ? '<all_urls>' : p);

  await chrome.scripting.unregisterContentScripts({ ids: [SCRIPT_ID] }).catch(()=>{});
  await chrome.scripting.registerContentScripts([{
    id: SCRIPT_ID,
    matches: toPatterns(splitLines(scope.includes)),
    excludeMatches: toPatterns(splitLines(scope.excludes)),
    js: ['Dollchan_Extension_Tools.es6.user.js'],
    runAt: 'document_idle',
    allFrames: true
  }]);
}

chrome.runtime.onInstalled.addListener(applyScope);
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes[SCOPE_KEY]) applyScope();
});

// Script signals
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	switch(request['de-messsage']) {
	case 'toggleDollchan': // Conversation with menu.js
		setStored('DESU_enabled', isEnabled = !isEnabled);
		setIcon(isEnabled);
		if(isEnabled) {
			// Run the script in active tab
			chrome.tabs.query({ active: true, currentWindow: true },
				tabs => runScript(tabs[0].id, tabs[0].url));
		}
		sendResponse({ answer: isEnabled });
		break;
	case 'corsRequest': { // Chrome-extension: avoid CORS in content-script.
		// Getting data from content-script and sending a CORS request.
		const { url, params } = request;
		if(params.body) {
			// Converting text data to blob & FormData for sending in the POST request
			const str = params.body.arr;
			const buf = new ArrayBuffer(str.length);
			const bufView = new Uint8Array(buf);
			for(let i = 0, len = str.length; i < len; ++i) {
				bufView[i] = str.charCodeAt(i);
			}
			const formData = new FormData();
			formData.append('file', new Blob([buf], { type: 'image/png' }), params.body.name);
			params.body = formData;
		}
		fetch(url, params).then(async res => {
			let answer;
			switch(params.responseType) {
			case 'arraybuffer':
			case 'blob': { // Converting arraybuffer/blob from the request response
				// to text data for sending to the content-script
				const arr =  new Uint8Array(await res.arrayBuffer());
				answer = '';
				for(let i = 0, len = arr.length; i < len; ++i) {
					answer += String.fromCharCode(arr[i]);
				}
				break;
			}
			default: answer = await res.text();
			}
			sendResponse({ isError: false, answer, status: res.status, statusText: res.statusText });
		}).catch(err => sendResponse({ isError: true, answer: err }));
		return true; // Will respond asynchronously
	}
	case 'world_script_run': {
		console.debug('world_script_run', request, sender, sendResponse);

		if((typeof request['function'] === 'undefined') || (request['function'] === null) || (request['function'] === '')) {
			sendResponse();
			return true;
		}

		let func;
		if(request['function'] in compiledScripts) {
			func = compiledScripts[request['function']];
		} else {
			console.warn('Была вызвана функция', request['function'], ', которой нет');
			func = () => {
				console.warn('Была вызвана функция', request['function'], ', которой нет');
			};
		}

		const target = { tabId: sender.tab.id };
		if(sender.frameId !== undefined && sender.frameId !== null) {
			target.frameIds = [sender.frameId];
		}

		const promise = chrome.scripting.executeScript({
			target : target,
			world  : 'MAIN',
			func   : func
		}).then(sendResponse);
		console.debug('world_script_run::promise', promise);
		return true; // Will respond asynchronously
	}
	default:
		sendResponse({ answer: 'Unknown request' });
	}
});

getStored('DESU_enabled').then(val => {
	if(typeof val !== 'boolean') {
		setStored('DESU_enabled', val = true);
	}
	setIcon(isEnabled = val);
});
}());
