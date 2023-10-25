import { MockDecorator } from './ModuleMock/MockDecorator';
import { NodeInfoDecorator } from './NodeInfo/NodeInfoDecorator';

export { parameters } from './ModuleMock/MockDecorator';

export const decorators = [MockDecorator, NodeInfoDecorator];
