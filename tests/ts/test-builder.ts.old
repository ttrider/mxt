import { importStatement, generateCode } from "../../src/ts/builder";


describe("builder", () => {
    test("import { member } from fromModule", () => {

        const is = importStatement("fromModule")
            .importMember("member")
            .build();

        const istext = generateCode(is);
        expect(istext).toMatchSnapshot();
    });

    test("import { member as local } from fromModule", () => {

        const is = importStatement("fromModule")
            .importMember("member", "local")
            .build();

        const istext = generateCode(is);
        expect(istext).toMatchSnapshot();
    });

    test("import defname from fromModule", () => {

        const is = importStatement("fromModule", "defname")
            .build();

        const istext = generateCode(is);
        expect(istext).toMatchSnapshot();
    });

    test("import defmember, { member1 as local1, member 2 } from fromModule", () => {

        const is = importStatement("fromModule", "defmember")
            .importMember("member1", "local1")
            .importMember("member2")
            .build();

        const istext = generateCode(is);

        expect(istext).toMatchSnapshot();
    });

});