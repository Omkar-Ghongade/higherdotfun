from algopy import (
    Global,
    Txn,
    UInt64,
    arc4,
    itxn,
    String,
)

class AssetCreator(arc4.ARC4Contract):
    # Store the created asset's ID in contract state
    asset_id: UInt64

    @arc4.abimethod(
        allow_actions=["NoOp"],
        create="require",
    )
    def create_application(self) -> None:
        # Optionally, initialize state or perform checks here
        pass

    @arc4.abimethod
    def create_asset(
        self,
        total: UInt64,
        decimals: UInt64,
        asset_name: String,
        unit_name: String,
        url: String,
    ) -> None:
        # Only the creator can call this method
        assert Txn.sender == Global.creator_address

        # Issue an asset creation transaction from the contract
        itxn.AssetConfig(
            config_asset=0,  # 0 means create new asset
            total=total,
            decimals=decimals,
            asset_name=asset_name,
            unit_name=unit_name,
            url=url,
            manager=Global.current_application_address,
            reserve=Global.current_application_address,
            freeze=Global.current_application_address,
            clawback=Global.current_application_address,
        ).submit()

        # Store the newly created asset's ID in contract state
        self.asset_id = itxn.created_asset_id()
