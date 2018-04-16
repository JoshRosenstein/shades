import React from 'react';
import { mount, render } from 'enzyme';

import Shades from './with-react';
import { states, mq } from './helpers';

const { Provider } = Shades;

describe('Shades DOM', () => {
  const mountShades = (inputStuff) => {
    const target = document.querySelector('head');
    return mount(
      <Provider target={target} showDebug={false}>
        {inputStuff}
      </Provider>
    );
  };

  it('Renders without incident', () => {
    const Title = Shades.h1({
      backgroundColor: {
        dark: 'blue',
        light: 'green',
        default: 'pink'
      },
      fontWeight: {
        dark: 600,
        light: 200
      },
      color: 'black',
      [mq().screen().from(300).to(750)]: {
        backgroundColor: 'purple'
      }
    });

    console.log(Title);

    // const subject = mount(
    //   <Title dark>Hello</Title>
    // );

    const subject = mountShades(
      <button title="what">Hello</button>
    );

    expect(subject).toBeDefined();
  });
  it('Forwards valid DOM props', () => {
    const Linky = Shades.a({
      backgroundColor: {
        dark: 'blue',
        light: 'green',
        default: 'pink'
      },
      fontWeight: {
        dark: 600,
        light: 200
      },
      color: 'black'
    });

    const subject = mountShades(
      <Linky href="hello.html" superDark="yeah" data-testing="just a test" aria-label="hello">Hello</Linky>
    );

    const anchorItem = subject.find('a');;

    expect(anchorItem).toHaveProp('href', 'hello.html');
    expect(anchorItem).toHaveProp('data-testing', 'just a test');
    expect(anchorItem).toHaveProp('aria-label', 'hello');
    expect(anchorItem).not.toHaveProp('superDark');
  });
});
