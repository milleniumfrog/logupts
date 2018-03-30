# LogUpTs

LogUpTs is an extendable class, which logs your message with a generated prefix and postfix. The prefix and postfix strings have the possibility to add Placeholder that will be replaced when the script executes. For example, you log 'hello world' with the following prefix: '{{month}}:{{year}} {{service(activeService)}}'. The result would be '03:2018 [LOG] hello world'.
In Nodejs you can also save your log to diffrent files.
