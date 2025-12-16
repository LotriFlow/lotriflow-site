require 'xcodeproj'
project_path = 'App.xcodeproj'
project = Xcodeproj::Project.open(project_path)

target = project.targets.find { |t| t.name == 'App' }
if target
  target.build_configurations.each do |config|
    # Add Capacitor to the header search paths
    config.build_settings['HEADER_SEARCH_PATHS'] ||= ['$(inherited)']
    unless config.build_settings['HEADER_SEARCH_PATHS'].include?('${PODS_ROOT}/Capacitor')
      config.build_settings['HEADER_SEARCH_PATHS'] << '${PODS_ROOT}/Capacitor'
    end
    
    # Add Swift include paths
    config.build_settings['SWIFT_INCLUDE_PATHS'] ||= ['$(inherited)']
    unless config.build_settings['SWIFT_INCLUDE_PATHS'].include?('${PODS_CONFIGURATION_BUILD_DIR}/Capacitor')
      config.build_settings['SWIFT_INCLUDE_PATHS'] << '${PODS_CONFIGURATION_BUILD_DIR}/Capacitor'
    end
  end
  project.save
  puts "✅ Fixed Capacitor import paths"
else
  puts "❌ Could not find App target"
end
