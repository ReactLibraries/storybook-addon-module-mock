import { MockDecorator } from './ModuleMock/MockDecorator.js';
import { NodeInfoDecorator } from './NodeInfo/NodeInfoDecorator.js';

export { parameters } from './ModuleMock/MockDecorator.js';

export const decorators = [MockDecorator, NodeInfoDecorator];
