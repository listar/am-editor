# @aomao/plugin-tasklist

Task list plugin

## Installation

```bash
$ yarn add @aomao/plugin-tasklist
```

Add to engine

```ts
import Engine, {EngineInterface} from'@aomao/engine';
import Tasklist, {CheckboxComponent} from'@aomao/plugin-tasklist';

new Engine(...,{ plugins:[Tasklist], cards:[CheckboxComponent] })
```

## Optional

### hot key

Default shortcut key `mod+shift+9`

```ts
//hot key
hotkey?: string | Array<string>;//default mod+shift+9
//Use configuration
new Engine(...,{
    config:{
        "tasklist":{
            //Modify shortcut keys
            hotkey: "shortcut key"
        }
    }
 })
```

## Command

You can pass in {checked:true} to indicate checked, optional parameters

```ts
//Use command to execute the plug-in and pass in the required parameters
engine.command.execute('tasklist', { checked: boolean });
//Use command to execute query current status, return false or current list plug-in name tasklist tasklist unorderedlist
engine.command.queryState('tasklist');
```
