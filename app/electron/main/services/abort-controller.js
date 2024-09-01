import {AbortController as NodeAbortController} from './node-abort-controller';

// const _AbortController = typeof AbortController === 'function' ? AbortController : NodeAbortController;

let ProcessAbortController;

if (typeof AbortController === 'function') {
  ProcessAbortController = AbortController;
} else {
  ProcessAbortController = NodeAbortController;
}

export { ProcessAbortController };
