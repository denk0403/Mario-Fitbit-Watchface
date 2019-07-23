function mySettings(props) {
  return (
    <Page>
      <Section title={<Text bold align="center">🎊 Enter Your Birthday 🎊</Text>}>
        <Text align="left">And when it comes around, Mario will have an extra special surprise waiting for you! 😄 
          <Text italic align="left">*Note: you can simply turn off this feature by entering an invalid date (e.g. Feb 30th)*</Text>
        </Text>
        <Select
          label={`Month`}
          settingsKey="month"
          selectViewTitle="Select a Month"
          options={[
            {name:"January", value:"0"},
            {name:"February", value:"1"},
            {name:"March", value:"2"},
            {name:"April", value:"3"},
            {name:"May", value:"4"},
            {name:"June", value:"5"},
            {name:"July", value:"6"},
            {name:"August", value:"7"},
            {name:"September", value:"8"},
            {name:"October", value:"9"},
            {name:"November", value:"10"},
            {name:"December", value:"11"}
          ]}
        />
        <Select
          label={`Date`}
          settingsKey="date"
          selectViewTitle="Select a Date"
          options={[
            {name:"1", value:"1"},
            {name:"2", value:"2"},
            {name:"3", value:"3"},
            {name:"4", value:"4"},
            {name:"5", value:"5"},
            {name:"6", value:"6"},
            {name:"7", value:"7"},
            {name:"8", value:"8"},
            {name:"9", value:"9"},
            {name:"10", value:"10"},
            {name:"11", value:"11"},
            {name:"12", value:"12"},
            {name:"13", value:"13"},
            {name:"14", value:"14"},
            {name:"15", value:"15"},
            {name:"16", value:"16"},
            {name:"17", value:"17"},
            {name:"18", value:"18"},
            {name:"19", value:"19"},
            {name:"20", value:"20"},
            {name:"21", value:"21"},
            {name:"22", value:"22"},
            {name:"23", value:"23"},
            {name:"24", value:"24"},
            {name:"25", value:"25"},
            {name:"26", value:"26"},
            {name:"27", value:"27"},
            {name:"29", value:"28"},
            {name:"29", value:"29"},
            {name:"30", value:"30"},
            {name:"31", value:"31"}
          ]}
        />
      </Section>
        
    </Page>
  );
}

registerSettingsPage(mySettings);
