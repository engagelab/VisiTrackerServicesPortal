class Iobserve < Sinatra::Application
  ######################## Events ##################################

  ### list all events by session id
  get '/session/:session_id/events' do
    if authorized?
      content_type :json
      sessionob = Sessionob.unscoped.find(params[:session_id])
      unless sessionob.nil? then
        return sessionob.eventobs.to_json
      end
    else
      status 401
    end
  end

  ### list all events from all sessions by space id and room id for portal
  get '/space/:space_id/:room_id/:startDT/:endDT/:type/events' do
    if authorized?
      content_type :json
      min = params[:startDT].to_i
      max = params[:endDT].to_i
      @alleventsforsessions = []
      sessions = Sessionob.where(:space_ids => params[:space_id], :room_id => params[:room_id], :created_on.gte => min, :finished_on.lte => max).only(:_id, :created_on, :label)
      sessions.each do |session|
        events = session.eventobs
        @alleventsforsessions.push(events.sort_by! { |x| x[:created_on] })
      end
      if params[:type] == 'durationquantity'
        '{"sessions" : ' + sessions.to_json(:only => [ :_id, :created_on, :label ]) + ', "events" : ' + @alleventsforsessions.to_json(:only => [ :_id, :created_on, :finished_on, :xpos, :ypos, :label, :interactions, :visitors, :age, :nationality ]) + '}'
      elsif params[:type] == 'actionsresources'
        '{"sessions" : ' + sessions.to_json(:only => [ :_id, :created_on, :label ]) + ', "events" : ' + @alleventsforsessions.to_json(:except => [:interaction_ids, :visitors]) + '}'
      elsif params[:type] == 'actionsresourcesbubble'
        '{"sessionevents" : ' + @alleventsforsessions.to_json(:only => [:interactions, :actions, :resources, :type]) + '}'
      elsif params[:type] == 'firstTurnEstimation'
        '{"events" : ' + @alleventsforsessions.to_json(:only => [:xpos, :ypos]) + '}'
      end
    else
      status 401
    end
  end

end
