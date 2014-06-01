exports.attach = function (options) {
  var app = this;

  app.tests = {
    php: {
      constants: {
        level: 'beginner',
        title: 'Constants',
      },
      logical_operators: {
        level: 'beginner',
        title: 'Logical operators',
      },
      control_structures: {
        level: 'beginner',
        title: 'Control structures',
      },
      functions: {
        level: 'beginner',
        title: 'Functions',
      },
      variable_scope: {
        level: 'beginner',
        title: 'Variable scope',
      },
      static_variables: {
        level: 'beginner',
        title: 'Static variables',
      },
      type_juggling: {
        level: 'beginner',
        title: 'Type juggling',
      },
      references: {
        level: 'beginner',
        title: 'References',
      },
      oop_class_instances: {
        level: 'beginner',
        title: 'OOP: Class instances',
      },
      oop_static: {
        level: 'beginner',
        title: 'OOP: Static methods',
      },
      predefined_variables: {
        level: 'beginner',
        title: 'Predefined variables',
      },
      exceptions: {
        level: 'beginner',
        title: 'Exceptions',
      },
      regular_expressions: {
        level: 'beginner',
        title: 'Regular Expressions',
      },
      xss: {
        level: 'beginner',
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
        level: 'beginner',
        title: 'Declaring variables',
      },
      defining_arrays: {
        level: 'beginner',
        title: 'Defining arrays',
      },
      defining_objects: {
        level: 'beginner',
        title: 'Defining objects',
      },
      redirection: {
        level: 'beginner',
        title: 'Redirection',
      },
      date_object: {
        level: 'beginner',
        title: 'Date object',
      },
    },
    mysql: {
      select: {
        level: 'beginner',
        title: 'Select query',
      },
      select_columns: {
        level: 'beginner',
        title: 'Selecting specific columns',
      },
      where: {
        level: 'beginner',
        title: 'Selecting specific rows',
      },
      limit: {
        level: 'beginner',
        title: 'Limit clause',
      },
      order_by: {
        level: 'beginner',
        title: 'Order By clause',
      },
      like: {
        level: 'beginner',
        title: 'Like clause',
      },
      count: {
        level: 'beginner',
        title: 'Count function',
      },
      concat: {
        level: 'beginner',
        title: 'Concat function',
      },
      update: {
        level: 'beginner',
        title: 'Update query',
      },
      insert: {
        level: 'beginner',
        title: 'Insert query',
      },
      delete: {
        level: 'beginner',
        title: 'Delete query',
      },
      limit2: {
        level: 'intermediate',
        title: 'Limit clause',
      },
      distinct: {
        level: 'intermediate',
        title: 'Distinct function',
      },
      subqueries: {
        level: 'intermediate',
        title: 'Subqueries',
      },
      left_join: {
        level: 'intermediate',
        title: 'Left join',
      }
    }
  };
}
