import Modal from "../Modal";
import {useUserDeadline, useUserSlippageTolerance} from "../../state/user/hooks";
import SlippageTabs from "../SlippageTabs";
import React from "react";
import {SettingsTab} from "../NavigationTabs";
import {AutoColumn} from "../Column";

export default function SettingsModal({
    open,
    onDismiss
}: {
    open: boolean,
    onDismiss: any
}) {
    const [userSlippageTolerance, setUserslippageTolerance] = useUserSlippageTolerance()
    const [deadline, setDeadline] = useUserDeadline()

    return (
        <Modal
            isOpen={open}
            onDismiss={onDismiss}
            maxHeight={451}
        >
            <AutoColumn gap={'lg'} style={{ padding: 24 }}>
                <SettingsTab
                    onDismiss={onDismiss}
                />
                <SlippageTabs
                    rawSlippage={userSlippageTolerance}
                    setRawSlippage={setUserslippageTolerance}
                    deadline={deadline}
                    setDeadline={setDeadline}
                />
            </AutoColumn>
        </Modal>
    )
}