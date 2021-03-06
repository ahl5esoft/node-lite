import { IAPI, ISession } from '../../contract';

export async function expressSessionAPIOption(api: IAPI, req: any) {
    let session = api as any as ISession;
    if (session.setSession)
        await session.setSession(req);
}