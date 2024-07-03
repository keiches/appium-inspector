// NOTE: tsconfig.json에 "allowJs: false"를 하면 해결되나, runtime 때, process 오류를 발생
import * as inspectorActions from './Inspector';
import * as sessionActions from './Session';

export default {
  ...inspectorActions,
  ...sessionActions,
};
