# LogUpTs v2

Version: 2.0.x

LogUpTs is an extendable class, which logs your messages with a customizable prefix and postfix to your console. A template system and a few predefined placeholders enable you to create timestamps with an easy syntax like this: "{{date}}:{{month}}:{{fullYear}}"=>"30.04.2018". You are also able to extend the placeholders with redefinitions and new ones. If you want to store the logs, the class has a transport layer which enables you to use plugins to save or send the log data. In this repository is the plugin logupts-transport-file included.

- [install logupts](#install)
- [setup](#setup)
- [extend](#extend)

# install <a name="install"></a>
```bash
npm i logupts --save
```
or use one of this links:
- no module loader: https://dev.milleniumfrog.de/cdn/logupts/2.0.0/browser/logupts.js
- require.js: https://dev.milleniumfrog.de/cdn/logupts/2.0.0/browser/logupts.amd.js
- es2015 modules: https://dev.milleniumfrog.de/cdn/logupts/2.0.0/browser/logupts.es2015.js

# setup <a name="setup"></a>
You can use the module in typescript and javascript.
## typescript
```typescript
import { LogUpTs } from 'logupts';
let logger:LogUpTs = new LogUpTs();
```



### Author
René Schwarzinger (milleniumfrog)

[License](./LICENSE) MIT