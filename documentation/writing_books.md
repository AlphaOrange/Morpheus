# Writing Books

_For Morpheus Version 0.6.0_

This documentation contains a detailed specification for book structures and files. Following these specs enables you to write your own _Morpheus_ books that can be played in the _Morpheus_ app for interactive story games.

### Writing YAML

All book files are .yaml files. So it is recommended to have at least basic knowledge of how to write YAML.

Learn more about YAML, for example here:  
https://www.yaml.info/learn/index.html

## What is a book

A book contains all information that is needed to set up the game world. Particularly books define:

- Places: the areas where characters can go and interact, split into destinations, locations and rooms.
- Characters: both player characters and non-player (ai-controlled) characters
- States: character stats and definitions of corresponding effects
- Agendas: structured definition of (non-player) characters' goals

## Overall Structure

A book is organized in a specific structure of folders and subfolders that contain .yaml files. The basic structure of a book looks like this:

```
[BookID]
├── book.yaml
├── world.yaml
├── agendas
│   └── [Agenda files]
│
├── characters
│   ├── [Character_1_ID]
│   │   ├── [Character_1_ID].yaml
│   │   ├── agendas
│   │   │   └── [Agenda files]
│   │   │
│   │   └── states
│   │       └── [State files]
│   │
│   └── [more Character folders]
│
├── destinations
│   ├── [Destination_1_ID]
│   │   ├── [Destination_1_ID].yaml
│   │   └── locations
│   │       ├── [Location_1_ID]
│   │       │   ├── [Location_1_ID].yaml
│   │       │   └── rooms
│   │       │       ├── [Room_1_ID]
│   │       │       │   └── [Location_1_ID].yaml
│   │       │       │
│   │       │       └── [more Room folders]
│   │       │
│   │       └── [more Location folders]
│   │
│   └── [more Destination folders]
│
└── states
    └── [State files]
```

### Minimal Requirements

Your book needs a `book.yaml` file, a `world.yaml` file and at least one of each of these:

- characters
- destinations
- locations
- rooms

### IDs

You can choose IDs freely as long as names only consist of lowercase and uppercase letters, numbers and underscores.

Short, memorable names are recommended, because players have to write these names in the message box when playing with text commands.

Valid and recommended:

- alice
- taproom
- market

Also valid, but not recommended:

- Alice (avoid uppercase letters)
- room2 (avoid being generic)
- the_town_market (avoid unnecessary long and complicated)

Invalid:

- "Alice Liddle" (no whitespace characters allowed)
- tap.room (invalid character)

### Image files

Images referenced in the .yaml files can be in the same folder as the file or in the root folder. Supported image formats are JPEG (.jpg or .jpeg) and PNG (.png).

If you want to reference an image in the same folder, just use the filename:

- `image: alice.jpg`

If you want to reference an image in the root folder (the folder with your `book.yaml`), prepend with a slash `/`:

- `image: /alice.jpg`

### Additional YAML files

You can split .yaml files by creating additional .yaml files in a folder. Compilation will combine alle .yaml files in a folder into one. Additional files will inserted using their filenames as keys, i.e. a file called `additional.yaml` will have its content added to the folders main file under the top-level key `additional`.

### Other files

All files that are not YAML or supported image files will be ignored in compilation.

### Example Structure

```
MyFirstBook
├── book.yaml
├── book_cover.png
├── world.yaml
├── agendas
│   ├── findfriend.yaml
│   └── earnmoney.yaml
│
├── characters
│   ├── alice
│   │   ├── alice.yaml
│   │   ├── alice.jpg
│   │   └── agendas
│   │       └── findjob.yaml
│   │
│   └── bob
│       ├── bob.yaml
│       ├── agendas (empty, but mandatory)
│       │
│       └── states
│           └── hunger.yaml
│
├── destinations
│   └── seatown
│       ├── seatown.yaml
│       └── locations
│           ├── inn
│           │   ├── inn.yaml
│           │   └── rooms
│           │       ├── taproom
│           │       │   └── taproom.yaml
│           │       │
│           │       └── backroom
│           │           └── backroom.yaml
│           │
│           └── market
│               ├── market.yaml
│               └── rooms
│                   └── spices
│                       └── spices.yaml
│
└── states
    ├── energy.yaml
    └── happiness.yaml
```

This exemplary book setup contains one location with two destinations (inn and market), one with two rooms, one with one room. Although normally you would not call a market stand (spices) a "room", in the logic of books, this is a room being a part of the market "location". The book also contains two characters (alice and bob), which can be built upon three states and three agendas defined throughout the book.

## World, Destinations, Locations and Rooms

_Morpheus_ features four different types of "places":

- World
- Destinations
- Locations
- Rooms

There is only one world in a book. The world is not a place to go to, but more a description of the general environment and book universe, that could for example include descriptions of flora and fauna, of political setup or currencies.

The other three have a hierarchical order: destinations consist of locations and locations consist of rooms. Character can move to destinations (we often call this traveling) or locations, but they will always arrive in rooms.

Usually destinations have the size of towns or islands, locations represant buildings, open places or forests and rooms the size of, well, rooms.  
However, it's up to you to use this as it fits your creative vision. Rooms for example could also be consecutive sections of a cave or different fishing spots on a small lake.

The most important difference in terms of dimensions is: Only destinations and locations have positions (like on a virtual map) used for the calculation of time it takes to move between them. Moving between rooms of a location always requires the same (small) amount of time.

## File Specifications

Each .yaml file must follow the specifications for the type of game element it defines. You must define everything that is not marked optional.
You could add additional entries, which would then just be ignored in book compiling, but it is strongly advised not to do so, because this can break the book in future game updates.

### Book File

There must be exactly one book file and it must be named `book.yaml`. The book file contains general descriptions and settings for your book. This file must contain the following items:

- `version`: an object with the following two items:
  - `book`: version number (x.y.z) of your book - increase with every update
  - `morpheus`: version number (x.y.z) of morpheus your book was built for
- `features`: a list of _Morpheus_ standard features that the book supports, see "Supported Features"
- `author`: your name (or synonym)
- `title`: the game title
- `description`: a short description, try to stay under 200 characters  
  _(optional - default: "An Interactive Morpheus Book")_
- `tags`: a list of one-word tags that classify your book (e.g. "thrilling")  
  _(optional - default: [])_
- `cover`: name of an image file in the same folder, or "" for Morpheus default cover  
  _(optional - default: "")_
- `start`: an object with the following items:
  - `destination`: ID of destination where the player starts
  - `location`: ID of location where the player starts
  - `room`: ID of room where the player starts
  - `datetime`: valid datetime of when the story starts in-game (e.g. '2020-03-01 10:00:00')  
    _(optional - default: "2020-01-01 12:00:00")_
  - `introduction`: an introduction text for the _user_ (not readable for the _characters_) at the very start of the story  
    _(optional - default: "Your story starts now!")_
- `options`: an object with book options - see "Book Options"  
  _(completely optional, all options entries optional - see "Book Options" for defaults)_

Make sure the IDs in `start` do not contradict each other.

#### Example

```yaml
---
version:
title: Electric City
  book: 1.0.0
  morpheus: 0.5.0
features:
  - move
  - talk
author: Stefan Tewes
description: >-
  You explore the Electric City of the year 2077, a place,
  where everything is connected.
tags:
  - scifi
  - cyborg
cover: cover.jpg
start:
  destination: electric_city
  location: casino
  room: gambling_hall
  datetime: '2077-06-01 09:00:00'
  introduction: >-
    After travelling through the waste lands for several
    you arrived at the Electric City in the morning.
    The town is full of lights and buzzing noises, but the streets
    are empty, so you enter the first building, the casino.
options:
  minPlayerChars: 1
  maxPlayerChars: 2
```

### World File

There must be exactly one world file and it must be named `world.yaml`. The world file contains a description of the world your book is set. Currently this file is not used by any game mechanics and its content is only displayed to the user for information. This file must contain the following items:

- `name`: the world's name  
  _(optional - default: "Unnamed World")_
- `description`: a short description, try to stay under 200 characters  
  _(optional - default: "No description")_
- `image`: name of an image file in the same folder, or "" for using the default world image  
  _(optional - default: "")_

#### Example

```yaml
---
name: The Big Hive
description: >-
  Everything is connected, everyone is connected. The world is a huge
  network that even span vast distances of wasteland between its
  buzzing hubs of humans and electric activity.
image: bighive.jpg
```

### Character File

Each character in the game has their own folder and character file. A character can be an NPC (non-player character) or a playable character or both. A playable NPC character if not chosen by the player will still appear in the game. A playable character not defined as NPC, will not.
The character file must have the same name as the character folder (the character ID) and contain the following items:

- `name`: character name
- `isPlayable`: if "true" the player can choose to control this character, otherwise set to "false"  
  _(optional - default: false)_
- `isNPC`: if "true" the character will appear as an NPC in the game (if not playable _and_ chosen by the player)  
  _(optional - default: true)_
- `description`: a short description only to be seen by the _player_  
  _(optional - default: "No description")_
- `description_player`: description to be shown in the "choose character" section  
  _(optional, only used if a character is both `isPlayable` and `isNPC`)_
- `gender`: _any_ text  
  _Be aware that some future game mechanics might only work for "male" and "female" characters_
- `age`: age as a number
- `image`: name of an image file in the same folder, or "" for default character image  
  _(optional - default: "")_  
  _Morpheus contains three default images: one for male gender, one for female gender and one for any other entry as gender_
- `profession`: short name of the characters' profession  
  _(optional - default: "Employed")_
- `behavior`: comprehensive description of character traits, behavior in general or in specific situations, how the person acts and speaks, preferrably as brief list  
  _(optional - default: "Friendly")_
- `body`: comprehensive description of distinctive body features, such as body type, eye color or hairstyle, preferrably as brief list  
  _(optional - default: "Average body")_
- `clothing`: comprehensive description of what the character wears right now, preferrably as brief list  
  _(optional - default: "Casual outfit")_
- `appearance`: comprehensive description of _how_ the character looks: is he well-groomed or exhausted and disheveled, do the clothes look brand-new or well-worn, preferrably as brief list  
  _(optional - default: "Normal appearance")_
- `background`: short description of the character's background story, only a few sentences mentioning what really matters for the character in the game and why
  _(optional - default: "")_
- `load_states`: list of IDs of states defined in the "states" folder in the top-level folder, that should be used for this character, in addition to those defined in the character's "states" folder  
  _(optional - default: [])_
- `load_agendas`: list of IDs of agendas defined in the "agendas" folder in the top-level folder, that should be used for this character, in addition to those defined in the character's "agendas" folder  
  _(optional - default: [])_
  _Note: agendas are not yet implemented in the game, use an empty list [] for now_
- `start`: an object with the following items:
  - `destination`: ID of destination where the character starts
  - `location`: ID of location where the character starts
  - `room`: ID of room where the character starts

_If "isNPC = false", you don't need to provide a `behavior` description, because it will not have any effect. You also don't need to set the `start` attribute, because this is set in the book file for player characters._  
_If "isPlayable = false", the `description_player` parameter has no effect. If "isPlayable = true" and "isNPC = false" you can also omit `description_player`, because `description` will be used as fallback anyway._

Note: Of the descriptive items, only `description` will ever be displayed for the player to read. All others (like `body`, `behavior`, `background`) are only for the AI to use. Keep them precise, short and concise, you don't need to flesh out whole polished sentences.

#### Full Example

```yaml
---
name: Bob
isPlayable: true
isNPC: true
description: >-
  A rather silent nurse, hiding half of his face behind a mask.
description_player: >-
  Bob treats everything from minor scratches to severe blowtorch
  wounds, and always with a smile behind his mask.
gender: male
age: 32
image: bob.jpg
profession: Nurse
behavior: >-
  attentive, helpful, intelligent, mostly an observer,
  you can get talkative once you are drawn into the conversation by others,
body: tall, strong build, short curly black hair with an undercut, striking eyebrows, dark eyes
clothing: worn open leather jacket, underneath a gray hoodie, black face mask
appearance: well-groomed appearance, older worn clothing, slightly exhausted look
background: >-
  your parents died early and you have achieved everything in life through
  your own efforts, so you decided to help others so they have it easier than you had
load_states:
  - energy
load_agendas: []
start:
  destination: seatown
  location: inn
  room: tabroom
```

### Agenda File

In the current version, no agenda files are used, yet.

### State File

States are specific attributes of characters that can change over the course of the game, e.g. "energy" or "hunger". They always have values between 0 and 100 and different values can cause characters to change behaviour or create events that the other characters can observe.  
State files can be defined in two different places:

- The character's "states" folder. The character automatically gets assigned all states in their folder.
- The "states" folder at the book's root level. A state defined there gets assigned to all characters that have the state's id listed in their `load_states` attribute. This way you only need to define a state once that you use for multiple characters. Of course, they will be independent in the game, e.g. Alice's and Bob's hunger values can progress differently.
  The file name (without the ".yaml" extension) is the state's id. Each state file has the following items:

- `name`: the state's name
- `description`: a very short description, try to stay under 50 characters
- `examples`: an object with the following items, try to stay under 50 characters each:
  - `major_decrease`: short example for what would majorly decrease the state's value
  - `minor_decrease`: short example for what would minorly decrease the state's value
  - `minor_increase`: short example for what would minorly increase the state's value
  - `major_increase`: short example for what would majorly increase the state's value  
    _(optional)_
- `base`: standard value for the state, used for game start and for resetting AI characters after longer absence  
  _(optional - default: 0)_
- `change`: an object with the following items:
  - `default`: change per hour as number
    _(optional - default: 0)_
  - `move`: change per hour when moving as number (used instead of `default`, not on top)
    _(optional - default: 0)_
  - `sleep`: change per hour when sleeping as number (used instead of `default`, not on top)
    _(optional - default: 0)_
  - `context`: array of 4 numbers, contextual changes corresponding to the `examples`
    _(optional - default: [-5, -2, +2, +5])_
- `intervals`: a list with any number of entries of this type:
  - `values`: array of two numbers between 0 and 100, in increasing order
    `effect`: short description of an effect of a state value in this value interval on the character  
    _(optional - default: [])_
- `events`: a list with any number of entries, each one of these types:
  - `above`: number between 0 and 100
    `hint`: a hint given to everyone in the room when state increases above the `above` value. You can use "%selfname%" as placeholder for a character's name
  - `below`: number between 0 and 100
    `hint`: a hint given to everyone in the room when state decreases below the `below` value. You can use "%selfname%" as placeholder for a character's name  
    _(optional - default: [])_

Note: See "Character States" for more information about how states work in the game, how they change and what effects they have.

#### Example

```yaml
---
name: Hunger
description: need of food for body energy
examples:
  major_decrease: eating energy-rich, big meals
  minor_decrease: eating s small snack
  minor_increase: physical work, see delicious food or others eat
  major_increase: heavy physical work, getting teased with food
base: 20
change:
  default: +3
  move: +4
  sleep: +3
  context: [-20, -4, +1, +4]
intervals:
  - values: [71, 90]
    effect: 'You are quite hungry.'
  - values: [91, 100]
    effect: 'You are so hungry, your stomach already hurts and you really need to eat to keep yourself going!'
events:
  - above: 80
    hint: "You hear %selfname%'s stomach growl"
```

### Destination File

Destinations are the largest type of places in the game. There must be at least one destination (serving as starting point for the player characters).  
The destination file must have the same name as the destination folder (the destination ID) and contain the following items:

- `name`: the destination's name
- `description`: a short description, try to stay under 200 characters  
  _(optional - default: "No description")_
- `position`: a list with two numbers, see "Position and Detour"  
  _(optional - default: [0, 0])_
- `detour`: a number, see "Position and Detour"  
  _(optional - default: 0)_
- `entry`: ID of a location in this destination, that characters start in after travelling to this destination. Can be "", then the (alphabetically) first location is used  
  _(optional - default: "")_
- `image`: name of an image file in the same folder, or "" for using the default destination image  
  _(optional - default: "")_

#### Example

```yaml
---
name: Seatown
description: >-
  Seatown is completely build on bridges that span the jagged rocky
  coastline. Staircases, stelts and copper lines form a jungle below
  the neon-lit houses.
position: [0, 5]
detour: 6
entry: inn
image: seatown.jpg
```

### Location File

Locations are the middle-size type of places in the game. There must be at least one location in every destination.  
The location file must have the same name as the location folder (the location ID) and contain the following items:

- `name`: the location's name
- `description`: a short description, try to stay under 200 characters  
  _(optional - default: "No description")_
- `position`: a list with two numbers, see "Position and Detour"  
  _(optional - default: [0, 0])_
- `detour`: a number, see "Position and Detour"  
  _(optional - default: 0)_
- `entry`: ID of a room in this location, that characters start in after moving to this location. Can be "", then the (alphabetically) first room is used  
  _(optional - default: "")_
- `image`: name of an image file in the same folder, or "" for using the default location image  
  _(optional - default: "")_

#### Example

```yaml
---
name: Market
description: >-
  The market of seatown is the highest place in town,
  positioned on sky-high stelts with a cable tower in the center.
  People crowd tightly together across the market square,
  neon signs and electric humming everywhere.
position: [0, 0]
detour: 2
entry: spice
image: market.jpg
```

### Room File

Rooms are the smallest type of places in the game. There must be at least one room in every location.  
The room file must have the same name as the room folder (the room ID) and contain the following items:

- `name`: the room's name
- `description`: a short description, try to stay under 200 characters  
  _(optional - default: "No description")_
- `image`: name of an image file in the same folder, or "" for using the default room image  
  _(optional - default: "")_
- `actions`: list of special actions that are enabled in this room, see "Special Character Actions" for list of possible entries  
  _(optional - default: [])_

_Note: rooms do not have position and detour, because all rooms are assumed nect to each other with constant amount of moving duration_

#### Example

```yaml
---
name: Spices Stand
description: >-
  The spice stand displays fragrant spices
  of all colors and shapes in small boxes
  and rainbow-colored test tubes.
image: market.jpg
actions: []
```

### Concepts and Explanations

#### Book Options

In the book file you can define options for your book. The following options are available:

##### Duration of Game Actions

- `talkDuration` (Default: 30): Seconds that pass for each talk action, regardless of text length
- `moveDurationRoom` (Default: 0): Time in seconds until character arrives in adjacent room (i.e. room of same location)
- `moveDurationLocation` (Default: 60): Time in seconds required for arriving in adjacent location (i.e. location of same destination) per travel distance unit -> see "Position and Detour" for calculation details
- `moveDurationDestination` (Default: 3600) # Time in seconds required for arriving in another destination per travel distance unit -> see "Position and Detour" for calculation details

_Example: Moving from a location at `position = [0, 0]` and `detour = 0` to another location at `position = [2, 0]` with `detour = 1` with `moveDurationLocation = 60` (default value) takes `3 * 60 = 180` seconds, so 3 minutes of in-game time._

##### Playable Number of Characters

- `minPlayerChars` (Default: 1): The minimum number of characters a user must choose to control
- `maxPlayerChars` (Default: 99): The maximum number of characters a player may choose to control  
  _(99 basically means "unlimited")_

##### State Management

- `playerCharsHaveStates` (Default: true): If `false`, for the chosen player characters states will be ignored (this does not apply for playable characters that the player chose not to control)

#### Character States

Each state represents a character statistic with a value between 0 and 100 that can change during the course of the game. For example "hunger" rises until the character eats something or "energy" goes down and gets refilled during sleeping phases. Changes in a state's value can cause effets visible to everyone in the same room, e.g. a person with low energy looking tired struggling with keeping their eyes open. For AI characters state values can also influence behaviour, e.g. said person might start to yawn a lot. There are two ways states change values: over time and contextually.

##### Interval Effects

Interval Effects only affect AI characters. They are defined as a list in the state attribute `intervals`. Example:

```yaml
intervals:
  - values: [71, 90]
    effect: 'You are quite hungry.'
  - values: [91, 100]
    effect: 'You are so hungry, your stomach already hurts and you really need to eat to keep yourself going
```

As long as the character's state value (here: hunger) is between 71 and 90, the AI gets the information "You are quite hungry" every time it's relevant, e.g. when generating responses in a dialog. If the value increases above 90, it falls in the other intervals and that text is induced instead. You are free to create as many intervals as you like. Intervals may overlap, although that's not recommended.

##### Threshold Events

Threshold Events are for both AI and Player characters. These do not affect the character's behaviour but define the state's effects that other characters may notice. They are defined in the state attribute `events`. Example:

```yaml
events:
  - above: 80
    hint: "You hear %selfname%'s stomach growl"
```

Let's assume a character named Aaron has a state "hunger" with this event. Once the Aaron's hunger state value rises above 80, all characters in the room will get the hint "You hear Aaron's stomach growl", including Aaron. The hint will also appear in the game dialog.  
An event can occur multiple times, but _Morpheus_ prevents it to trigger too fast after another if a value oscillates around an event value.

##### Change Over Time

All state values in the game get updated every time time passes in the game. These changes are defined in the state attribute `change`. Example:

```yaml
change:
  default: +3
  move: +4
  sleep: +3
```

All change values in the state file mean "change per hour". Here, if a character is not occupied with a durational action ("move", also see "Special Character Actions"), their state changes by +3 per hour (the `default` change). That means, when the game jumps for 10 minutes, the state changes by `+3 * 10/60 = +0.5`. If a character is performing a specific action like "move" or "sleep", the corresponding change value is applied instead.

##### Contextual Change

Contextual changes are applied _on top_ of time-based change, therefore they should only account for very specific reasons. For these changes _Morpheus_ uses multiple state attributes. Example:

```yaml
name: Hunger
description: need of food for body energy
examples:
  major_decrease: eating energy-rich, big meals
  minor_decrease: eating s small snack
  minor_increase: physical work, see delicious food or others eat
  major_increase: heavy physical work, getting teased with food
change:
  context: [-20, -4, +1, +4]
```

The _Morpheus_ AI decides in specific intervals if a change is applied for contextual reasons. The attributes `name`, `description` and `examples` help the AI by defining what context might cause what degree of change. The AI then decides for "no change" or one of the four degrees of change defined in `examples` and then applies the corresponding change value from `change.context` (defined in the same order as examples).  
If for example a character eats a chocolate bar, the AI then evaluates and probably decides on "minor_decrease", applying a change of -4 to the "hunger" state value.

##### State Reset

AI characters do not act if not in a scene with at least one player character present (this is called "idling"). That also means AI characters can not decide to eat if hungry or to sleep if tired if no one is around. Therefore if you encounter an AI character that was idling for at least 1 hour, their state values are reset to the value defined by the state attribute `base`. It's also the start value for all characters.

_NOTE: This only applies after longer idling. If an AI character accompanies you for a longer time they might need to eat and sleep explicitly just as your characters!_

#### Position and Detour

`position` numbers are used for calculating travelling distances between locations or destinations. Imagine the position as coordinates on a map. _Morpheus_ uses the mathematical distance between two positions as distance and multiplies with a book-specific factor in order to get the duration of travel. If one moves from a room to another location, the distance between the two locations is used. If one travels from a room to another destination, the distance between the two destinations is used.  
The `detour` values of both start and end point are added to the distance. Imagine these as the difficulty of getting in or out of a place, e.g. a city in the mountains or a hut in a swamp.

Example: The characters are in room "Spices Stand" in the location "Market" and want to move to the location "Inn".

- position of "Market": [2, 4]
- position of "Inn": [1, 0]
- because the market is very crowded it has a detour of 3.

Travel distance is now $\sqrt{(2-1)^2+(4-0)^2}+3 \approx 7.1$

_Currently in Morpheus a location distance of 1 is equivalent to 1 minute of moving, a destination distance of 1 is equivalent to 1 hour of moving - we will make this configurable in the future_

#### Special Character Actions

There are some specific actions that users can command their characters, that are only possible in specific rooms. To enable them you need to put the action keyword in the room's `actions` parameter. The current list is:

- `"sleep"`: A character can sleep in this room

#### Supported Features

In your book you can give a list of supported features, so users can directly see of which _Morpheus_ features a book makes use. Later there will also be filter options so users can search for books supporting specific features. In your list use the exact names out of this list of currently supported features if the book meets the requirements:

- "maps": Map positions are used for distance calculation, i.e. there is at least one destination or location with position other than [0, 0] or detour other than 0.
- "move": Player must be able to move to at least one other room from the starting location.
- "talk": In every configuration of the book there must be at least one NPC you can meet (and talk to).
- "visual": There are any custom images for places or characters.

## Compiling books

The _Morpheus_ app does not use the book folders as described above, but one compiled file that was preprocessed and contains all necessary information in one place.  
Currently there is no stand-alone compiler, books need to be compiled together with the main program instead - see the Morpheus repository and Readme on how to do that. However, there are plans to change this in the future, so new books can be introduces way simpler.
