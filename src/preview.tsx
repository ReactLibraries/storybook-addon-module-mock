import { MockDecorator } from './features/ModuleMock/decorator.js';
import { NodeInfoDecorator } from './features/NodeInfo/decorator.js';

export { parameters } from './features/ModuleMock/decorator.js';

export const decorators = [MockDecorator, NodeInfoDecorator];
