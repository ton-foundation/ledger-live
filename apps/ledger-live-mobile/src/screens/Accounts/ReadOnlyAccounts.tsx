import React, { useCallback, memo, useMemo } from "react";
import { FlatList } from "react-native";
import { useSelector } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import {
  isCurrencySupported,
  listSupportedCurrencies,
  listTokens,
  useCurrenciesByMarketcap,
} from "@ledgerhq/live-common/lib/currencies";
import { Flex, Box } from "@ledgerhq/native-ui";

import { SafeAreaView } from "react-native-safe-area-context";
import { useRefreshAccountsOrdering } from "../../actions/general";
import { accountsSelector } from "../../reducers/accounts";
import TrackScreen from "../../analytics/TrackScreen";

import { withDiscreetMode } from "../../context/DiscreetModeContext";
import ReadOnlyAccountRow from "./ReadOnlyAccountRow";
import { TAB_BAR_SAFE_HEIGHT } from "../../components/TabBar/TabBarSafeAreaView";

type Props = {
  navigation: any;
  route: { params?: { currency?: string; search?: string } };
};

const listSupportedTokens = () =>
  listTokens().filter(t => isCurrencySupported(t.parentCurrency));

function Accounts({ navigation, route }: Props) {
  const accounts = useSelector(accountsSelector);

  const refreshAccountsOrdering = useRefreshAccountsOrdering();
  useFocusEffect(refreshAccountsOrdering);

  const cryptoCurrencies = useMemo(
    () => listSupportedCurrencies().concat(listSupportedTokens()),
    [],
  );

  const sortedCryptoCurrencies = useCurrenciesByMarketcap(cryptoCurrencies);

  const assets = useMemo(
    () =>
      sortedCryptoCurrencies.slice(0, 10).map((currency, i) => ({
        balance: 0,
        currency,
        id: i,
        type: "Account",
      })),
    [sortedCryptoCurrencies],
  );

  const data = [
    ...assets.map(({ currency }) => (
      <Box key={currency.id} mx={6}>
        <ReadOnlyAccountRow navigation={navigation} currency={currency} />
      </Box>
    )),
    <Box mx={6}>{/* Gradient box here */}</Box>,
  ];

  return (
    <SafeAreaView
      style={{ flex: 1 }}
      edges={["top", "left", "right"]} // see https://github.com/th3rdwave/react-native-safe-area-context#edges
    >
      <TrackScreen category="Accounts" accountsLength={accounts.length} />
      <Flex flex={1} bg={"background.main"}>
        <FlatList
          data={data}
          renderItem={({ item }: any) => item}
          keyExtractor={item => item.id}
          contentContainerStyle={{
            paddingBottom: TAB_BAR_SAFE_HEIGHT,
          }}
        />
      </Flex>
    </SafeAreaView>
  );
}

export default memo(withDiscreetMode(Accounts));
