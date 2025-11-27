import HeaderBox from '@/components/HeaderBox'
import RecentTransactions from '@/components/RecentTransactions';
import RightSidebar from '@/components/RightSidebar';
import TotalBalanceBox from '@/components/TotalBalanceBox';
import { getAccount, getAccounts } from '@/lib/actions/bank.actions';
import { getLoggedInUser } from '@/lib/actions/user.actions';

const Home = async ({ searchParams: { id, page } }: SearchParamProps) => {
  const currentPage = Number(page as string) || 1;
  const loggedIn = await getLoggedInUser();
  const accounts = await getAccounts({ 
    userId: loggedIn.$id 
  })

  if(!accounts) return;
  
  const accountsData = accounts?.data;

  if(!accountsData || accountsData.length === 0) {
    return (
      <section className="home">
        <div className="home-content">
          <header className="home-header">
            <HeaderBox 
              type="greeting"
              title="Welcome"
              user={loggedIn?.firstName || 'Guest'}
              subtext="Connect a bank account to see balances and activity."
            />
          </header>
        </div>
      </section>
    )
  }

  const requestedAccount = accountsData.find(
    (account) => account.appwriteItemId === id
  );
  const fallbackAccount = accountsData[0];
  const appwriteItemId = (requestedAccount || fallbackAccount)?.appwriteItemId;

  if(!appwriteItemId) return;

  const account = await getAccount({ appwriteItemId })
  const transactions = account?.transactions ?? [];

  return (
    <section className="home">
      <div className="home-content">
        <header className="home-header">
          <HeaderBox 
            type="greeting"
            title="Welcome"
            user={loggedIn?.firstName || 'Guest'}
            subtext="Access and manage your account and transactions efficiently."
          />

          <TotalBalanceBox 
            accounts={accountsData}
            totalBanks={accounts?.totalBanks}
            totalCurrentBalance={accounts?.totalCurrentBalance}
          />
        </header>

        <RecentTransactions 
          accounts={accountsData}
          transactions={transactions}
          appwriteItemId={appwriteItemId}
          page={currentPage}
        />
      </div>

      <RightSidebar 
        user={loggedIn}
        transactions={transactions}
        banks={accountsData?.slice(0, 2)}
      />
    </section>
  )
}

export default Home