# Tightly Controlled Textareas — Building solid plain text editors in React

If you have done React for a while, there is a slim chance that you would have missed the concept of **Controlled Components**.

## 🍹 A Controlled Components' Refresher

As a refresher to what they are, let's take a look at a controlled `textarea` component. The source of the truth for the state of the content is managed by the parent component of the `textarea`.

As such, the code looks something like below:

```
import React, { Component } from 'react';

class ControlledTextarea extends Component {
  constructor(props) {
    super(props)
    this.state = { content: '' }
  }

  onChange = (event) => this.setState(
    { content: this.textarea.value },
  );

  render() {
    return (
      <textarea
        ref={c => { this.textarea = c; }}
        value={this.state.content}
        onChange={this.onChange}
      />
    );
  }
}
```

Simple, right? This serves us well when all we care about is the text content. But can the above `textarea` component, be used to serve as the backbone for a good/solid text editor?

## 🤔 The case for the need of a better model

Imagine that we are building a plain text editor for writing markdown. Imagine that we have an operation which can turn a selected string of characters (`Hello` in the following screenshot) into **bold **text.

![](https://res.cloudinary.com/hashnode/image/upload/w_800/v1504086787/gn3dlwc8g4jwxkevdwaj.png)

That would mean wrapping the selection with `**`! So if we perform the said operation — turning selected characters to be bold — successfully, then the result would look like the following!

![](https://res.cloudinary.com/hashnode/image/upload/w_800/v1504086985/j07iafyzc2ppqlcr1jrg.png)

If we were to implement this with the above `ControlledTextarea` component, without changing the component itself; what we would have is a very smelly implementation of a plain-text markdown editor — manually calculating the selection offsets from the DOM, and then updating them back to reflect the new editor state...

We definitely need something better!

## 👌 Defining the model for a solid text editor

In 2014, Nick Santos, an ex Medium engineer, has written a [brilliant article](https://medium.engineering/why-contenteditable-is-terrible-122d8a40e480) on why the native `contenteditable` is a terrible framework for building rich text editors!

Among other things in the article he leaves us with a model for building solid rich text editors — which could be summarised in the following three statements!

1. **We should be able to represent the entire editor state through a data model.**
2. **The data model should have a well defined set of edit operations.**
3. **The data model should have a one-on-one map to the DOM.**

This is in context of a rich text editor, but I say it can also be applied for building plain text editors! Let's see how!

### Statement 1

**We should be able to represent the entire editor state through a data model**; which includes selection state.

This is simple, we will just add an extra property to the state object.

```
this.state = {
  content: '',
  selection: { startOffset: 0, endOffset: 0 }
};
```

### Statement 2

**The data model should have a well defined set of edit operations.**

This is also easy, we just update the `state` whenever there's a new `{ content, selection }` object.

Imagine that we have a string of characters all selected — Hello —, and we want to turn them to bold:

![](https://res.cloudinary.com/hashnode/image/upload/w_800/v1504087210/xxlbvtkqfpcyae1qtz4z.png)

The state for the above representation of the editor would be:

```
{
    content: "Hello",
    selection: { startOffset: 0, endOffset: 5 }
}
```

Now all we have to do is pass a corresponding new object reflecting that bold has been added to the selected characters:

```
{
    content: "**Hello**",
    selection: { startOffset: 2, endOffset: 7 }
}
```

Imagine that there is a utility function called `boldTokenAdder` which does this for us, then our `setState` call would look simply like below:

```
const newState = boldTokenAdder({ oldContent, oldSelection });
this.setState(newState);
```

...which would be represented in the editor as:

![](https://res.cloudinary.com/hashnode/image/upload/w_800/v1504087553/gvgquagldkkogibbkwq5.png)

### Statement 3

**The data model should have a one-on-one map to the DOM.**

This is a bit tricky, not tricky per se, but there's a bunch of code that needs to be written, to make this seamless.

The `content` part is easy; but we also have to substantiate the claim that our `state` as the source of truth for `selection` is actually a truth.

For achieving this, first we need to make sure that every mouse click, every keystroke, all selection events, and all focus events account for a change in selection; and the following is the code which does just that using corresponding event listeners, when the component mounts!

```
constructor(props) {
  super(props);
  this.state = {
    content: '',
    selection: { startOffset: 0, endOffset: 0 }
  };
  this.selectionUpdateEvents = [
    'select',
    'click',
    'focus',
    'keyup'
  ];
}

selectionUpdateListener = () => this.setState(
  { selection: this.getSelection(this.textarea) }
);

componentDidMount() {
  const addEventListeners = () => this.selectionUpdateEvents.forEach(
    eventType => this.textarea.addEventListener(
      eventType,
      this.selectionUpdateListener
    )
  );
  addEventListeners();
}

componentWillUnmount() {
  const removeEventListeners = () => this.selectionUpdateEvents.forEach(
    eventType => this.textarea.removeEventListener(
      eventType,
      this.selectionUpdateListener
    )
  );
  removeEventListeners();
}
```

We will also have a dedicated update function — `updateTextarea` — which ensures `selection` state is updated, along with the `content`, when changes are made to the editor.

We will also hook our original `onChange` function to use `updateTextarea`.

```
updateTextarea = ({ content, selection }) => {
  const updatedContent = content || this.textarea.value;
  const updatedSelection = selection || this.getSelection(this.textarea);
  this.setState(
    { content: updatedContent, selection: updatedSelection },
    () => this.setSelectionToDOM(this.textarea, updatedSelection)
  );
}

onChange = (event) => this.updateTextarea({
  content: this.textarea.value,
  selection: this.getSelection(this.textarea)
});
```

`this.textarea` in the above piece of code is a `ref` to the corresponding `textarea` component instance!

```
<textarea
  ref={c => { this.textarea = c; }}
  value={this.state.content}
  onChange={this.onChange}
/>
```

`getSelection` (from `textarea` in the DOM), and `setSelectionToDOM` are helper functions that ensure a sync between what our state reports, and what the actual DOM has to say about the `textarea`'s selection.

```
getSelection = (textareaRef) => ({
  startOffset: textareaRef.selectionStart,
  endOffset: textareaRef.selectionEnd,
});

setSelectionToDOM = (textareaRef, selection) => {
  textareaRef.selectionStart = selection.startOffset;
  textareaRef.selectionEnd = selection.endOffset;
}
```

As you can see, if we don't pass either of the `content`, or the `selection` to `updateTextarea`; the corresponding values are derived from the DOM.

```
const updatedContent = content || this.textarea.value
const updatedSelection = selection || this.getSelection(this.textarea);
```

That's it! Lo and behold, we have a tightly controlled textarea!

## 💔 Problems ? Yes — Broken Undo

Undo/Redo would be broken when we solely use `updateTextarea` function to update the text editor; because we are not updating the `textarea` through a `onChange`'s `event`.

But fret not, since the entire source of truth is managed as a state, we can put the `state` of the component through a super lightweight undo manager like this — https://github.com/fatman-/easy-undo — and have corresponding key bindings (`Ctrl+Z` | `Cmd+Z` / `Ctrl+Shift+Z` | `Cmd+Shift+Z`) in the text editor to use the said undo manager for undo/redo, instead of the native undo/redo!

## ❤️ Complete Code

The following could be further optimised, but as PoC the following works! Note that the following implementation doesn't (yet) have the custom undo manager!

```
import React, { Component } from 'react';

class TightlyControlledTextarea extends Component {
    constructor(props) {
        super(props);
        this.state = {
            content: '',
            selection: { startOffset: 0, endOffset: 0 }
        };
        this.selectionUpdateEvents = [
            'select',
            'click',
            'focus',
            'keyup'
        ];
    }

    selectionUpdateListener = () => this.setState(
        { selection: this.getSelection(this.textarea) }
    );

    getSelection = (textareaRef) => ({
        startOffset: textareaRef.selectionStart,
        endOffset: textareaRef.selectionEnd,
    });

    setSelectionToDOM = (textareaRef, selection) => {
        textareaRef.selectionStart = selection.startOffset;
        textareaRef.selectionEnd = selection.endOffset;
    }

    componentDidMount() {
        const addEventListeners = () => this.selectionUpdateEvents.forEach(
            eventType => this.textarea.addEventListener(
                eventType,
                this.selectionUpdateListener
            )
        );
        addEventListeners();
    }

    componentWillUnmount() {
        const removeEventListeners = () => this.selectionUpdateEvents.forEach(
            eventType => this.textarea.removeEventListener(
                eventType,
                this.selectionUpdateListener
            )
        );
        removeEventListeners();
    }

    onChange = () => this.updateTextarea({
        content: this.textarea.value,
        selection: this.getSelection(this.textarea)
    });


    updateTextarea = ({ content, selection }) => {
        const updatedContent = content || this.textarea.value;
        const updatedSelection = selection || this.getSelection(this.textarea);
        this.setState(
            {
                content: updatedContent,
                selection: updatedSelection
            },
            () => this.setSelectionToDOM(
                this.textarea,
                updatedSelection
            )
        );
    }

    render() {
        return (
            <textarea
                ref={c => { this.textarea = c; }}
                value={this.state.content}
                onChange={this.onChange}
            />
        );
    }
}
```
