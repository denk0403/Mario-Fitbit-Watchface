function mySettings(props) {
    return (
        <Page>
            <Section
                title={
                    <Text bold align="center">
                        Have Your Phone? 📱
                    </Text>
                }
            >
                <Text align="left">
                    This feature will notify you with an alert if your phone has been out of distance or disconnected
                    for too long.
                </Text>
                <Toggle
                    settingsKey="toggleAlert"
                    label={`Alerts: ${props.settings.toggleAlert === "true" ? "On" : "Off"}`}
                />
                <TextInput
                    label="Delay (in minutes)"
                    settingsKey="waitTime"
                    type="number"
                    placeholder=""
                    disabled={!(props.settings.toggleAlert === "true")}
                />
            </Section>
            <Section
                title={
                    <Text bold align="center">
                        🎊 Party Mode 🎊
                    </Text>
                }
            >
                <Text align="left">
                    When your birthday comes around, Mario will have an extra special surprise waiting for you! 😄
                </Text>
                <Toggle
                    settingsKey="toggleBirthday"
                    label={`Party Mode: ${props.settings.toggleBirthday === "true" ? "On" : "Off"}`}
                />
                <TextInput
                    label="Enter Your Birthday"
                    settingsKey="birthday"
                    type="date"
                    placeholder=""
                    disabled={!(props.settings.toggleBirthday === "true")}
                />
            </Section>
            <Button
                label={
                    <Text bold align="center">
                        Clear Settings
                    </Text>
                }
                onClick={() => props.settingsStorage.clear()}
            />
        </Page>
    );
}

registerSettingsPage(mySettings);
