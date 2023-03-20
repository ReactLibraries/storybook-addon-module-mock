import { DecoratorFn } from '@storybook/react';
import React from 'react';
import { useEffect } from 'react';

const getDisplayValue = (element: Element) =>
  element instanceof HTMLInputElement
    ? element.value
    : element instanceof HTMLSelectElement
    ? element.options[element.selectedIndex].value
    : undefined;

const getRole = (node: Element) => {
  const tag = node.tagName.toLowerCase();
  const type = node.getAttribute('type');
  const roles = {
    button: 'button',
    input_checkbox: 'checkbox',
    input_radio: 'radio',
    input_search: 'searchbox',
    input_text: 'textbox',
    select: 'listbox',
    textarea: 'textbox',
    a: 'link',
    img: 'img',
    nav: 'navigation',
    article: 'article',
    aside: 'complementary',
    footer: 'contentinfo',
    header: 'banner',
    main: 'main',
    section: 'region',
    ul: 'list',
    ol: 'list',
    li: 'listitem',
    table: 'table',
    th: 'columnheader',
    tr: 'row',
    td: 'gridcell',
  };

  return (
    node.getAttribute('role') ??
    (roles[tag as keyof typeof roles] || roles[`${tag}_${type}` as keyof typeof roles])
  );
};

const getLabel = (node: Element | HTMLInputElement) => {
  if (!('labels' in node)) return null;
  const label = node.labels?.[0];
  if (!label) return null;
  const control = label.control;
  return control === node ? label.textContent : null;
};

const getAccessibility = (node: Element) =>
  Object.fromEntries([
    ...Array.from(node.attributes)
      .filter(({ name }) => name.startsWith('aria-'))
      .map(({ name, value }) => [name, value]),
  ]);

export const InfoDecorator: DecoratorFn = (Story) => {
  useEffect(() => {
    const property: { element?: Element | null } = {};
    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const element = document.elementFromPoint(mouseX, mouseY);
      if (element !== property.element) {
        property.element = element;
        element &&
          !['html', 'body'].includes(element.tagName.toLowerCase()) &&
          console.table({
            tag: element.tagName,
            role: getRole(element),
            accessibility: getAccessibility(element),
            label: getLabel(element),
            display: getDisplayValue(element),
            testId: element.getAttribute('data-testid'),
            placeholder: element.getAttribute('placeholder'),
            text: element.textContent?.trim(),
          });
      }
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  return <Story />;
};
