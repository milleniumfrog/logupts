describe('LOGUPTS-SPEC-JS', () => {
    describe('test internals and defaults', () => {
		it ('check class exists', () => {
			if (logupts.LogUpTs === undefined)
				throw new Error("class LogUpTs not defined");
		})
		it ('class with defaultConstructor', () => {
			let logger = new logupts.LogUpTs({quiet: true});
			chai.expect(logger.generateString("{{service}}")).equals("[LOG]")
		})
		it('test internal, output [LOG] hello world', () => {
			let logger = new logupts.LogUpTs({quiet: true});
			let str = logger.internal({praefix: ''}, {}, '{{service}} ', 'hello world');
			chai.expect(str).equals('[LOG] hello world');
		})
	})
	describe('test normal class behavior', () => {
		it('log hello world', () => {
			let logger = new logupts.LogUpTs({quiet: true});
			let str = logger.log("hello world");
			chai.expect(str).equals('[LOG] hello world');
		})
		it('error', () => {
			let logger = new logupts.LogUpTs({quiet: true});
			let str = logger.error((new Error("this is an error").message));
			chai.expect(str).equals('[ERROR] this is an error');
		})
		it('info', () => {
			let logger = new logupts.LogUpTs({quiet: true});
			let str = logger.info("hello world");
			chai.expect(str).equals('[INFO] hello world');
		})
		it('warn', () => {
			let logger = new logupts.LogUpTs({quiet: true});
			let str = logger.warn("hello world");
			chai.expect(str).equals('[WARN] hello world');
		})
		it('custom', () => {
			let logger = new logupts.LogUpTs({quiet: true});
			let str = logger.custom('{{frog}}; ', '', "hello world");
			chai.expect(str).equals('All Contributers: milleniumfrog; hello world');
		})
	})
})