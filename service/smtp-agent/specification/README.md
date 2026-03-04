# Specification - Acceptance Testing

This file outlines the process for writing acceptance tests. We call this the specification and we use it to ensure that the software we build meets new requirements while maintaining compliance with old requirements.

## Basic Approach

As new tickets are created and prioritised new test files should be written and the old acceptance tests should continue working. There should be no need to add new tests to the old test files. If a test is no longer relevant it should be removed and the new ticket should have a new acceptance test to cover the change.

If you make a code change and an old test fails you should review the test to see if the test is still relevant. If the test is still relevant then you must review the old test to understand why it is failing as a well written acceptance test should not fail due to a code change. To resolve this you will need to update the original test file to ensure that the test passes regardless of your code change.

## Naming Convention

Files should be named after the ticket identifier. For example, if the ticket is `ABC-123`, the file should be named `abc-123.spec.ts`. Tests should outline the requirements defined in the ticket and should be written in a way that is easy to understand.

## Writing Tests

Tests should be kept simple and should only interact with the public API of the application or service. You should not be unit testing private methods or functions. You should not be testing the specific implemention as it can change. You should write tests that confirm the requirements of the ticket are met - nothing more.