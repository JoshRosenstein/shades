<img src="docs/media/sunglasses.svg" height="300px" alt="Shades icon">

> Icon made by <a href="https://www.flaticon.com/authors/creaticca-creative-agency" title="Creaticca Creative Agency">Creaticca Creative Agency</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a>

# Shades

[![Build Status](https://travis-ci.org/bupa-digital/shades.svg?branch=master)](https://travis-ci.org/bupa-digital/shades)

This is an experimental CSS-in-JS library, designed to be very similar to Glamorous, but supports rendering styles to shadow dom (or anywhere else you want, really)

Updates coming continuously, as we finish up our final testing and bug fixing, in preparation for rolling out to Bupa web platforms.

## Live REPL

If you want to try it out in a repl, [here's one I prepared earlier!](https://codesandbox.io/s/v3ypj97xz3)

## Why

This library follows very closely with the syntax of certain prior-art, particularly: Glamorous.  Glamorous, in turn, follows a similar path to Aphrodite.  I looked into the pros and cons of both the Object-Literal style and the Template Literal style for building Shades, and decided to pursue the former, not because template literals are unfamiliar, but because I felt that the reasons I had for even considering a CSS-in-JS library were to get away from the CSS language.  So it made most sense to me to stay closer to JavaScript, in this case.  One day in the future this may change, but for now, if you want Template Literal syntax in addition to the Object Literal syntax, you will need to submit a PR :)

The Architecture we are moving towards at Bupa is something we like to call Valhalla.  It's a Monorepo Front-End architecture, which exposes modular web-components that serve as render targets for the underlying React components, where the actual UI logic comes from.  This is in order to allow us full flexibility and choice in the technology we want to use, while using smoke-and-mirrors to allow certain CMS solutions the illusion of full rendering control (Which they seem to demand for no good reason - and it had forced us to use Angular for a lot longer than we wanted)

This presented a problem when we wanted to use CSS-in-JS libraries such as Glamorous and Styled-Components.  We immediately discovered that there is a style boundary between elements in the shadow dom and the parent document.  Most CSS in JS libraries render the style tags to the `head` of the parent document, and have no ability to configure that behaviour to point to the Shadow DOM instead.  So, I decided it was time to have a go at making one of these myself.

Shout out to the wonderful creators of the Emotion library for their blog post on this subject, on which this library drew its initial inspiration.

## Peer Dependencies

Please ensure you install all the peer dependencies that are mentioned by yarn/npm after installing this package, if any.  This will not work without them.

## Usage

### Simple Tutorial

This assumes you're going to be using React.  There is an agnostic `css` function that you can also use, but it's somewhat verbose.  Documentation for it will be coming later on.

`yarn add @bupa-digital/shades`

The most important part of using Shades is the Shades provider - similar to Redux and other libraries, we use a Provider to supply a render target to all Shades elements that might be used inside the render tree.  This also means that you can have different Shades instances with different render targets for different shadow doms.

Here's an example of what a top level web component might look like:

`components/App.js`:

```js
import React from 'react';
import ReactDOM from 'react-dom';
import { Shades } from '@bupa-digital/shades/react';

import CounterView from './CounterView';

customElements.define('counter-view', class extends HTMLElement {
  getAllAttributes() {
    const getAttr = (name) => this.getAttribute(name);

    const attributeNames = this.getAttributeNames();
    const attributeObj = attributeNames.reduce((result, attrKey) => ({
      ...result,
      [attrKey]: getAttr(attrKey)
    }), {});

    return attributeObj;
  }
  connectedCallback() {
    // Always use mode: open, never use mode: closed.
    const shadowRoot = this.attachShadow({ mode: 'open' });
    const attrs = this.getAllAttributes();
    // To support web compoment children in your react element
    const children = <slot />;

    const props = {
      ...attrs,
      children
    };

    ReactDOM.render(
      <Shades to={shadowRoot}>
        <CounterView {...props} />
      </Shades>
    )
  }
});
```

If you want to have shades show you pretty log messages to tell you what it's doing, pass `showDebug={true}` to the Shades provider, like so:

```js
<Shades to={shadowRoot} showDebug={true}>
  <CounterView {...props} />
</Shades>
```

(Remember to turn that off for production builds!)

And to use shades to style stuff, here's an example of most of its functionality:

`components/CounterView.js`

```js
import React from 'react';
import shades from '@bupa-digital/shades/react';
import { states } from '@bupa-digital/shades/helpers';

const colours = {
  button: {
    dark: '#00335b',
    light: '#0079c8',
    border: {
      dark: '#000000'
    }
  },
  text: {
    dark: '#ffffff',
    light: '#000000'
  }
}

// You can use just about any valid CSS with it (not sure about keyframes yet though)
const SimpleBox = shades.div({
  padding: '10px',
  boxShadow: '3px 3px 3px #000',
  color: '#000',
  ':hover': {
    textDecoration: 'underline'
  },
  ':focus': {
    textDecoration: 'underline'
  }
  '::before': {
    content: 'hello there'
  }
});


// The above example is a basic CSS pseudo classes selector.
// But since the selector is applying the same CSS property,
// we can combine those pseudo classes using ...states.all
const SimpleBox = shades.div({
  padding: '10px',
  boxShadow: '3px 3px 3px #000',
  color: '#000',
  ...states.all('hover', 'focus')({
    textDecoration: 'underline'
  }),
  '::before': {
    content: 'hello there'
  }
});

// Here we showcase a few magical features you can use in shades rules,
// specifically, you can use functions that take props as rules,
// and even do pattern matching on props!
const Button = shades.button({
  border: '1px solid',
  // Yes, all props passed to this component can be used in both patterns and in functions
  color: ({ dark }) => dark && colours.text.dark,
  // Use the states helper to simplify pseudo-classes like `:hover`, `:active` and `:visited`
  // Alternatively, just specify a key like `':hover'` (see the SimpleBox example above)
  ...states({
    hover: {
      fontWeight: 'bold',
      textDecoration: 'underline',
      // You can even do media queries way down here
      '@media screen and (max-width: 400px)': {
        border: '1px dotted',
        ...states({
          active: {
            border: '2px dotted'
          }
        })
      },
      // There's even a media query helper library built-in!
      // Here's an equivalent version using the mq helper:
      [mq('screen').to(400)]: {
        border: '1px dotted',
        ...states({
          active: {
            border: '2px dotted'
          }
        })
      }
    }
  })
});

const PseudoIcon = shades.i({
  // For pseudo-elements like `::before`, `::after`, `::first-letter`, etc
  // you don't need to include the `::` prefix, because Shades knows what you
  // mean (since thankfully there are no standard style rules that have the same names)
  before: {
    fontSize: '15px',
    content: 'Hello there!'
  },
  // And as expected, you can do this in pseudo states too
  ...states({
    hover: {
      after: {
        fontFamily: 'Material Icons',
        content: 'close'
      }
    }
  }),
  // Browser prefixes are also supported as string keys
  '-webkit-text-stroke': '4px navy'
})

// Pattern matching can be done for individual style rule values,
// like so:
const PatternButton = shades.button({
  padding: '10px',
  boxShadow: '3px 3px 3px #000',
  backgroundColor: {
    // Only the first match will become the value of this rule, in the case of
    // multiple matching props
    dark: colours.button.dark,
    light: colours.button.light,
    // Yep, even functions can be used in pattern matching. In this case,
    // `value` is the value of the `mode` property, if its defined.
    // If `mode` is not `super`, then this fn returns false, and
    // this property will be skipped.  You can return any falsy
    // value from a function to skip the style rule.
    mode: value => value === 'super' && 'yellow',
    // If there is a "default" value defined, then that will be the value
    // if there are no matching props. If you don't have a default and no
    // props match, then the style rule will be skipped safely.
    default: '#ffffff'
  },
  // Example of a pattern without defaults:
  color: {
    dark: colours.text.dark,
    light: colours.text.light,
    mode: 'green'
    // If this component is not given any of those 3 props,
    // then the `color` rule will be skipped, since there is no
    // default value defined.
  }
});

// The above example is called "inline pattern matching" - where
// you change the value of a single rule based on certain props.
// But sometimes you need to set multiple style rules for a matching prop,
// so Shades now supports a method for that!
const BlockPatternBox = shades.div({
  padding: '10px',
  boxShadow: '3px 3px 3px #000',
  color: '#000'
}).match({
  // By calling .match at the end of the call to an element,
  // we append block patterns to the main styles based on which
  // props have been passed in - like the inverse of inline patterns.
  dark: {
    color: 'purple',
    border: '5px solid green'
  },
  light: {
    color: 'cyan',
    border: '10px solid magenta',
    background: 'red'
  }
});

export default () => (
  <SimpleBox>
    <Button light>Hello there</Button>
    <Button dark>Goodbye there</Button>
    <Button mode="super">Goodbye there</Button>
    <Button>This is plain</Button>
  </SimpleBox>
);
```

Shades will also happily pass along valid DOM properties to the styled element, such as `alt`, `title`, `href` for `a` tags, `src` for `img` and others, you get the picture.  Valid React props are also fully supported, such as `className`, `onClick`, etc.

Example:

```js
const Linky = shades.a({
  fontSize: '20px',
  fontWeight: 'bold'
});

export default () => (
  <Linky href="hello.html" title="This is a link" onClick={(event) => console.log('Wow, I was clicked!')}>
    Go to greeting
  </Linky>
);
```

You can also pass along `data` and `aria` attributes as you please!

```js
<Button data-greeting="Hello there" aria-label="This is not a good label, just an example">
  Click me!
</Button>
```

## Helpers

Check out the [documentation on our built-in helpers](docs/helpers.md)

More documentation coming soon, but I hope this helps you to get started :)
