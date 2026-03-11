// help-content.ts
export const HELP_CONTENT = {
  title: 'Help',
  description:
    'Welcome to the help page for Join, your guide to using our kanban project management tool. Here, we will provide an overview of what Join is, how it can benefit you, and how to use it.',

  sections: [
    {
      heading: 'What is Join?',
      paragraphs: [
        'Join is a kanban-based project management tool designed and built by a group of dedicated students as part of their web development bootcamp at the Developer Akademie.',
        'Kanban, a Japanese term meaning "billboard", is a highly effective method to visualize work, limit work-in-progress, and maximize efficiency (or flow). Join leverages the principles of kanban to help users manage their tasks and projects in an intuitive, visual interface.',
        'It is important to note that Join is designed as an educational exercise and is not intended for extensive business usage. While we strive to ensure the best possible user experience, we cannot guarantee consistent availability, reliability, accuracy, or other aspects of quality regarding Join.',
      ],
    },
    {
      heading: 'How to use it',
      description: 'Here is a step-by-step guide on how to use Join:',
      steps: [
        {
          title: 'Exploring the Board',
          text: 'When you log in to Join, you will find a default board. This board represents your project and contains four default lists: "To Do", "In Progress", "Await Feedback", and "Done".',
        },
        {
          title: 'Creating Contacts',
          text: 'In Join, you can add contacts to collaborate on your projects. Go to the "Contacts" section, click on "New contact", and fill in the required information. Once added, these contacts can be assigned tasks and they can interact with the tasks on the board.',
        },
        {
          title: 'Adding Cards',
          text: 'Now that you have added your contacts, you can start adding cards. Cards represent individual tasks. Click the "+" button under the appropriate list to create a new card. Fill in the task details in the card, like task name, description, due date, assignees, etc.',
        },
        {
          title: 'Moving Cards',
          text: 'As the task moves from one stage to another, you can reflect that on the board by dragging and dropping the card from one list to another.',
        },
        {
          title: 'Deleting Cards',
          text: 'Once a task is completed, you can either move it to the "Done" list or delete it. Deleting a card will permanently remove it from the board. Please exercise caution when deleting cards, as this action is irreversible.',
        },
      ],
    },
  ],
  remember:
    'Remember that using Join effectively requires consistent updates from you and your team to ensure the board reflects the current state of your project.',
  contact:
    'Have more questions about Join? Feel free to contact us at <a href="mailto:your-contact-email@example.com">projects.developerakademie@web.de</a>. We are here to help you!',
  close: 'Enjoy using Join!'
};
