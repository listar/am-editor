# @aomao/plugin-strikethrough

Strikethrough style plugin

## Installation

```bash
$ yarn add @aomao/plugin-strikethrough
```

Add to engine

```ts
import Engine, {EngineInterface} from'@aomao/engine';
import Strikethrough from'@aomao/plugin-strikethrough';

new Engine(...,{ plugins:[Strikethrough] })
```

## Optional

### hot key

The default shortcut key is `mod+shift+x`, and multiple shortcut keys are passed in as an array

```ts
//hot key,
hotkey?: string | Array<string>;

//Use configuration
new Engine(...,{
    config:{
        "strikethrough":{
            //Modify shortcut keys
            hotkey: "shortcut key"
        }
    }
 })
```

## Command

```ts
engine.command.execute('strikethrough');
//Use command to execute query current status, return boolean | undefined
engine.command.queryState('strikethrough');
```
