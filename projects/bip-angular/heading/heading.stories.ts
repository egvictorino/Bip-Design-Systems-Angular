import { Component } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipHeading } from './heading.component';

@Component({
  selector: 'bip-heading-demo',
  imports: [BipHeading],
  template: `
    <h1 bipHeading>Heading h1</h1>
    <h2 bipHeading>Heading h2</h2>
    <h3 bipHeading>Heading h3</h3>
    <h4 bipHeading>Heading h4</h4>
    <h5 bipHeading>Heading h5</h5>
    <h6 bipHeading>Heading h6</h6>
  `,
})
class HeadingDemo {}

const meta: Meta<HeadingDemo> = {
  title: 'Components/Heading',
  component: HeadingDemo,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<HeadingDemo>;

export const AllLevels: Story = {};
