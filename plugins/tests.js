exports.attach = function (options) {
  var app = this;

  app.tests = {
    php: {
      constants: {
        level: 'basic',
        title: 'Constants',
      },
      logical_operators: {
        level: 'basic',
        title: 'Logical operators',
      },
      control_structures: {
        level: 'basic',
        title: 'Control structures',
      },
      functions: {
        level: 'basic',
        title: 'Functions',
      },
      variable_scope: {
        level: 'basic',
        title: 'Variable scope',
      },
      static_variables: {
        level: 'basic',
        title: 'Static variables',
      },
      type_juggling: {
        level: 'basic',
        title: 'Type juggling',
      },
      references: {
        level: 'basic',
        title: 'References',
      },
      oop_class_instances: {
        level: 'basic',
        title: 'OOP: Class instances',
      },
      oop_static: {
        level: 'basic',
        title: 'OOP: Static methods',
      },
      predefined_variables: {
        level: 'basic',
        title: 'Predefined variables',
      },
      exceptions: {
        level: 'basic',
        title: 'Exceptions',
      },
      regular_expressions: {
        level: 'basic',
        title: 'Regular Expressions',
      },
      xss: {
        level: 'basic',
        title: 'Cross site scripting (XSS)'
      },
      mathematical_functions: {
        level: 'intermediate',
        title: 'Mathematical functions',
      },
      array_functions: {
        level: 'intermediate',
        title: 'Array functions',
      },
      date_functions: {
        level: 'intermediate',
        title: 'Date functions',
      },
      oop_constructor: {
        level: 'intermediate',
        title: 'OOP: Constructor',
      },
      oop_extending: {
        level: 'intermediate',
        title: 'OOP: Extending a class',
      },
    },
    js: {
      declaring_variables: {
        level: 'basic',
        title: 'Declaring variables',
      },
      defining_arrays: {
        level: 'basic',
        title: 'Defining arrays',
      },
      defining_objects: {
        level: 'basic',
        title: 'Defining objects',
      },
      redirection: {
        level: 'basic',
        title: 'Redirection',
      },
      date_object: {
        level: 'basic',
        title: 'Date object',
      },
    }
  };
}
