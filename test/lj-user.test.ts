import test from 'ava';
import { parseUserTags } from '../src/index.js';

test('basic user link', t => {
  const input = '<lj user="username">';
  t.deepEqual(parseUserTags(input), {
    '<lj user="username">': 'username',
  });
});

test('multiple users', t => {
  const input = '<lj user="username"> <lj user="anotherUser">';
  t.deepEqual(parseUserTags(input), {
    '<lj user="username">': 'username',
    '<lj user="anotherUser">': 'anotherUser',
  });
})

test('with other markup', t => {
  const input = '<img src="foo.jpg"><lj user="username"></img>';
  t.deepEqual(parseUserTags(input), {
    '<lj user="username">': 'username',
  });
});