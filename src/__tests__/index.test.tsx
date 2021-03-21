import React from 'react'
import { render } from '../../lib/test-utils'
import HomePage from 'src/pages'

test('ホームページ', () => {
  const { container } = render(<HomePage />)
  expect(container).toMatchSnapshot()
})
